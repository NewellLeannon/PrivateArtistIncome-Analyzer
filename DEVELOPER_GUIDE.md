# FHEVM Developer Guide

A comprehensive guide for developers building privacy-preserving smart contracts with FHEVM.

## Table of Contents

1. [Getting Started](#getting-started)
2. [FHEVM Fundamentals](#fhevm-fundamentals)
3. [Building Contracts](#building-contracts)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js v20 or higher
- npm v7 or higher
- Basic understanding of Solidity
- Basic understanding of encryption concepts

### Installation

```bash
# Clone or fork the repository
git clone <your-repo>
cd <your-repo>

# Install dependencies
npm install

# Install FHEVM hardhat plugin
npm install --save-dev @fhevm/hardhat-plugin

# Compile contracts
npm run compile
```

## FHEVM Fundamentals

### What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) integrates Fully Homomorphic Encryption (FHE) into Ethereum smart contracts, enabling:

1. **Computation on Encrypted Data**: Perform calculations without decryption
2. **Privacy Preservation**: Data remains encrypted throughout processing
3. **Cryptographic Guarantees**: Mathematical proof of privacy (not reliant on trust)

### Core Concepts

#### 1. Encrypted Types

FHEVM provides encrypted integer types:

```solidity
euint32  // 32-bit encrypted integer
euint64  // 64-bit encrypted integer
euint8   // 8-bit encrypted integer
ebool    // Encrypted boolean
```

#### 2. Operations on Encrypted Data

```solidity
euint32 sum = FHE.add(a, b);         // Addition
euint32 diff = FHE.sub(a, b);        // Subtraction
euint32 prod = FHE.mul(a, b);        // Multiplication
ebool equal = FHE.eq(a, b);          // Equality comparison
ebool greater = FHE.gt(a, b);        // Greater than
euint32 conditional = FHE.select(condition, ifTrue, ifFalse);
```

#### 3. Permission Model

FHEVM uses a dual-permission model:

```solidity
// Contract can use the encrypted value in operations
FHE.allowThis(encryptedValue);

// Specific user can decrypt the encrypted value later
FHE.allow(encryptedValue, userAddress);
```

**Critical**: Both permissions are required for most operations.

## Building Contracts

### Step 1: Import FHEVM Libraries

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyPrivateContract is ZamaEthereumConfig {
    // Your contract code
}
```

### Step 2: Declare Encrypted State Variables

```solidity
contract DataStorage is ZamaEthereumConfig {
    // Store encrypted user balances
    mapping(address => euint64) public encryptedBalances;

    // Store encrypted secrets
    euint32 private encryptedSecret;
}
```

### Step 3: Accept Encrypted Inputs

```solidity
function submitEncryptedValue(
    externalEuint32 encryptedInput,
    bytes calldata inputProof
) external {
    // Convert external encrypted input to internal format
    euint32 value = FHE.fromExternal(encryptedInput, inputProof);

    // Use the encrypted value
    euint32 result = FHE.add(value, FHE.asEuint32(10));

    // Always grant permissions
    FHE.allowThis(result);
    FHE.allow(result, msg.sender);

    // Store or further process
}
```

### Step 4: Implement Decryption (If Needed)

#### Option A: User Decryption

User can decrypt their own data:

```solidity
function getUserData() external view returns (bytes32) {
    return FHE.toBytes32(encryptedBalances[msg.sender]);
}

// User decrypts off-chain using their key
```

#### Option B: Async Decryption

Request decryption through relayer for aggregate results:

```solidity
function finalizeResults() external {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(aggregateResult);

    // Request decryption through relayer
    FHE.requestDecryption(cts, this.processDecryption.selector);
}

function processDecryption(
    uint256 requestId,
    bytes memory decryptedData,
    bytes memory signatures
) external {
    // Verify signatures
    FHE.checkSignatures(requestId, decryptedData, signatures);

    // Decode plaintext result
    uint32 result = abi.decode(decryptedData, (uint32));

    // Process as needed
}
```

### Step 5: Implement Business Logic

Example: Private voting system

```solidity
contract PrivateVoting is ZamaEthereumConfig {
    struct Vote {
        ebool forProposal;  // Encrypted vote
    }

    mapping(address => Vote) public votes;

    function submitEncryptedVote(
        externalEuint32 encryptedVote,
        bytes calldata proof
    ) external {
        euint32 vote = FHE.fromExternal(encryptedVote, proof);

        // Convert 1 to true, 0 to false
        ebool voteDecision = FHE.eq(vote, FHE.asEuint32(1));

        votes[msg.sender].forProposal = voteDecision;

        FHE.allowThis(voteDecision);
    }
}
```

## Testing

### Unit Testing with Hardhat

```typescript
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("PrivateVault", function () {
  it("should store and retrieve encrypted funds", async function () {
    // Deploy contract
    const vault = await ethers.deployContract("PrivateVault");
    const vaultAddress = await vault.getAddress();

    // Get test signer
    const [signer] = await ethers.getSigners();

    // Create encrypted input
    const encryptedAmount = await fhevm
      .createEncryptedInput(vaultAddress, signer.address)
      .add64(1000n)
      .encrypt();

    // Submit encrypted transaction
    const tx = await vault.submitFunds(
      encryptedAmount.handles[0],
      encryptedAmount.inputProof
    );
    await tx.wait();

    // Retrieve encrypted value
    const encryptedBalance = await vault.getBalance(signer.address);

    // Decrypt for verification
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      vaultAddress,
      signer
    );

    expect(decrypted).to.equal(1000n);
  });
});
```

### Testing Best Practices

1. **Always use mock environment**: `require(!fhevm.isMock)` for real network checks
2. **Test both operations and permissions**: Verify both computation and access control
3. **Test edge cases**: Overflows, underflows, zero values
4. **Test failure scenarios**: Unauthorized access, invalid inputs

## Deployment

### Local Development

```bash
# Start local node
npm run chain

# In another terminal, deploy
npm run deploy:localhost
```

### Sepolia Testnet

1. **Configure environment variables**:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

2. **Deploy contract**:

```bash
npm run deploy:sepolia
```

3. **Verify contract** (optional):

```bash
npm run verify:sepolia -- <contract_address>
```

### Production Deployment Checklist

- ✅ All tests passing
- ✅ Contract audited
- ✅ Security best practices implemented
- ✅ Gas optimization reviewed
- ✅ Emergency pause mechanism (if needed)
- ✅ Event logging for all important operations
- ✅ Proper access control modifiers

## Best Practices

### Security

1. **Always Grant Both Permissions**

```solidity
// ✅ CORRECT
FHE.allowThis(encrypted);
FHE.allow(encrypted, msg.sender);

// ❌ WRONG - Missing allowThis
FHE.allow(encrypted, msg.sender);
```

2. **Validate Input Proofs**

Input proofs are zero-knowledge proofs that validate:
- Data is actually encrypted
- Encryption binding is correct
- Signer authorization

```solidity
// Proof validation happens automatically in FHE.fromExternal
euint32 value = FHE.fromExternal(encryptedInput, proof);
```

3. **Prevent Common Attacks**

```solidity
// ❌ DON'T: Return encrypted values from view functions
function getBalance() external view returns (euint64) {
    return encryptedBalance[msg.sender];  // User can't decrypt this!
}

// ✅ DO: Return handle for user to decrypt off-chain
function getBalance() external view returns (bytes32) {
    return FHE.toBytes32(encryptedBalance[msg.sender]);
}
```

### Design Patterns

1. **Encryption Binding**: Values bound to specific contracts and users
2. **Access Control**: Role-based permissions with modifiers
3. **State Separation**: Public state (for logic) vs Encrypted state (for privacy)

```solidity
contract PrivateRegistry is ZamaEthereumConfig {
    // Public state (for business logic)
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public registrationTime;

    // Encrypted state (for privacy)
    mapping(address => euint64) private encryptedSecretValue;
}
```

4. **Async Decryption**: For non-interactive decryption of aggregate results

### Gas Optimization

1. **Minimize FHE operations** - They're expensive
2. **Batch operations** when possible
3. **Use appropriate integer sizes** (euint8 vs euint64)

```solidity
// ✅ GOOD: One FHE.add per user per transaction
function deposit(externalEuint64 amount, bytes calldata proof) external {
    euint64 value = FHE.fromExternal(amount, proof);
    balance[msg.sender] = FHE.add(balance[msg.sender], value);
}

// ❌ EXPENSIVE: Multiple FHE operations in loop
function batchDeposit(externalEuint64[] calldata amounts, bytes[] calldata proofs) external {
    for (uint i = 0; i < amounts.length; i++) {
        euint64 value = FHE.fromExternal(amounts[i], proofs[i]);
        balance[msg.sender] = FHE.add(balance[msg.sender], value);  // For each item!
    }
}
```

## Troubleshooting

### Compilation Errors

**Error**: `Cannot find module '@fhevm/solidity'`

**Solution**:
```bash
npm install @fhevm/solidity @fhevm/hardhat-plugin
npm run compile
```

---

**Error**: `ZamaEthereumConfig not found`

**Solution**: Ensure you're importing from correct location:
```solidity
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

### Test Failures

**Error**: `Cannot use ebool in if statement`

**Solution**: Use `FHE.select` for conditional logic:
```solidity
// ❌ WRONG
if (encryptedBool) { }

// ✅ CORRECT
euint32 result = FHE.select(encryptedBool, value1, value2);
```

---

**Error**: `Missing FHE.allowThis() permissions`

**Solution**: Always grant contract permissions:
```solidity
FHE.allowThis(encryptedValue);  // Add this line
FHE.allow(encryptedValue, msg.sender);
```

---

**Error**: `userDecryptEuint failed`

**Solution**: Ensure proper permissions were granted and user is correct:
```solidity
// In contract
FHE.allow(encryptedValue, msg.sender);  // Grant to transaction sender

// In test
const decrypted = await fhevm.userDecryptEuint(
  FhevmType.euint32,
  encryptedHandle,
  contractAddress,
  signer  // Same signer that submitted transaction
);
```

### Performance Issues

**Slow compilation**: FHEVM contracts require additional processing
- First compile: slower (compiles FHE operations)
- Subsequent compiles: faster (uses cache)

**Slow tests**: Each test operation involves encryption/decryption
- Use focused test suites with `--grep` flag
- Consider test timeout settings in `hardhat.config.ts`

## Additional Resources

- **Official Documentation**: https://docs.zama.ai/fhevm
- **Zama Forum**: https://www.zama.ai/community
- **GitHub Examples**: https://github.com/zama-ai/fhevm-hardhat-template
- **Discord Community**: https://discord.com/invite/zama

## Contributing

When contributing examples or improvements:

1. Follow existing code style
2. Include comprehensive comments
3. Add unit tests for new functionality
4. Update documentation
5. Test on both local and Sepolia

---

**Happy Building with FHEVM!** 🔐

For questions or issues, reach out to the Zama community.
