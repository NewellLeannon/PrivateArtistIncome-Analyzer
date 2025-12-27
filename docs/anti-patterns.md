# Common Pitfalls and Anti-Patterns

## Overview

Working with FHEVM requires different patterns than traditional smart contracts. This guide outlines common mistakes and how to avoid them.

## Anti-Pattern #1: Missing `FHE.allowThis()`

### ❌ INCORRECT

```solidity
function storeEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputValue, inputProof);
    storedValue = encryptedValue;

    // Only allowing msg.sender - MISSING allowThis()
    FHE.allow(encryptedValue, msg.sender);
}

// Later trying to use the value
function calculateSum() external view returns (euint32) {
    euint32 result = FHE.add(storedValue, FHE.asEuint32(10));  // ⚠️ FAILS!
    return result;
}
```

**Problem**: Contract itself needs permission to use encrypted values.

### ✅ CORRECT

```solidity
function storeEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputValue, inputProof);
    storedValue = encryptedValue;

    // Grant permissions to both contract and user
    FHE.allowThis(encryptedValue);      // ✅ Contract can use it
    FHE.allow(encryptedValue, msg.sender);  // ✅ User can decrypt it
}
```

## Anti-Pattern #2: Using View Functions with Encrypted Values

### ❌ INCORRECT

```solidity
// View functions cannot return encrypted values to users directly
function getMyBalance() external view returns (euint32) {
    return balances[msg.sender];  // ⚠️ User cannot decrypt this!
}
```

**Problem**: View functions don't modify state, so permissions can't be granted. Users can't decrypt the returned handle.

### ✅ CORRECT

**Option 1: Return Handle for Decryption**
```solidity
function getMyBalance() external view returns (bytes32) {
    // Return the handle that user can decrypt off-chain
    return FHE.toBytes32(balances[msg.sender]);
}
```

**Option 2: Use Async Decryption**
```solidity
function requestMyBalance() external {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(balances[msg.sender]);

    // Ensure user has permission
    FHE.allow(balances[msg.sender], msg.sender);

    FHE.requestDecryption(cts, this.processBalanceDecryption.selector);
}

function processBalanceDecryption(
    uint256 requestId,
    bytes memory decryptedData,
    bytes memory signatures
) external {
    FHE.checkSignatures(requestId, decryptedData, signatures);
    uint32 balance = abi.decode(decryptedData, (uint32));
    // Emit event or store plaintext result
}
```

## Anti-Pattern #3: Mismatched Signer for Input Proof

### ❌ INCORRECT

```typescript
// Alice creates encrypted input
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add32(100)
  .encrypt();

// Bob tries to use Alice's encrypted input
const tx = await contract
  .connect(bob)  // ⚠️ Wrong signer!
  .submitValue(encryptedInput.handles[0], encryptedInput.inputProof);
```

**Problem**: Input proof is bound to the creator's address. Bob cannot use Alice's proof.

### ✅ CORRECT

```typescript
// Bob creates his own encrypted input
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, bob.address)
  .add32(100)
  .encrypt();

// Bob uses his own encrypted input
const tx = await contract
  .connect(bob)  // ✅ Matching signer
  .submitValue(encryptedInput.handles[0], encryptedInput.inputProof);
```

## Anti-Pattern #4: Forgetting Input Proof Parameter

### ❌ INCORRECT

```solidity
function submitValue(externalEuint32 inputValue) external {
    // Missing inputProof parameter!
    euint32 value = FHE.fromExternal(inputValue);  // ⚠️ COMPILATION ERROR
}
```

**Problem**: `FHE.fromExternal()` requires both the handle AND the proof.

### ✅ CORRECT

```solidity
function submitValue(
    externalEuint32 inputValue,
    bytes calldata inputProof  // ✅ Include proof
) external {
    euint32 value = FHE.fromExternal(inputValue, inputProof);
}
```

## Anti-Pattern #5: Returning Encrypted Values Without Permissions

### ❌ INCORRECT

```solidity
function calculateResult(externalEuint32 input, bytes calldata proof) external returns (euint32) {
    euint32 value = FHE.fromExternal(input, proof);
    euint32 result = FHE.add(value, storedValue);
    return result;  // ⚠️ Caller cannot decrypt this!
}
```

**Problem**: Returning an encrypted value doesn't automatically grant permissions to the caller.

### ✅ CORRECT

```solidity
function calculateResult(externalEuint32 input, bytes calldata proof) external returns (euint32) {
    euint32 value = FHE.fromExternal(input, proof);
    euint32 result = FHE.add(value, storedValue);

    // Grant permissions before returning
    FHE.allow(result, msg.sender);
    return result;
}
```

## Anti-Pattern #6: Conditional Logic on Encrypted Booleans

### ❌ INCORRECT

```solidity
function transfer(address to, externalEuint32 amount, bytes calldata proof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, proof);

    // Cannot use encrypted bool in if statement directly
    ebool hasEnough = FHE.gte(balances[msg.sender], encryptedAmount);

    if (hasEnough) {  // ⚠️ COMPILATION ERROR: ebool cannot be used in if
        balances[msg.sender] = FHE.sub(balances[msg.sender], encryptedAmount);
        balances[to] = FHE.add(balances[to], encryptedAmount);
    }
}
```

**Problem**: Cannot use encrypted boolean in traditional `if` statements.

### ✅ CORRECT

```solidity
function transfer(address to, externalEuint32 amount, bytes calldata proof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, proof);

    ebool hasEnough = FHE.gte(balances[msg.sender], encryptedAmount);

    // Use FHE.select for conditional assignment
    euint32 newSenderBalance = FHE.select(
        hasEnough,
        FHE.sub(balances[msg.sender], encryptedAmount),  // If true
        balances[msg.sender]                             // If false
    );

    euint32 newReceiverBalance = FHE.select(
        hasEnough,
        FHE.add(balances[to], encryptedAmount),  // If true
        balances[to]                             // If false
    );

    balances[msg.sender] = newSenderBalance;
    balances[to] = newReceiverBalance;
}
```

## Anti-Pattern #7: Overflow/Underflow Without Checks

### ❌ INCORRECT (Simplified Example)

```solidity
function increment(externalEuint32 value, bytes calldata proof) external {
    euint32 encryptedValue = FHE.fromExternal(value, proof);
    // No overflow check - could wrap around
    count = FHE.add(count, encryptedValue);  // ⚠️ What if overflow?
}
```

**Problem**: FHE operations don't have built-in overflow protection like Solidity 0.8+.

### ✅ CORRECT

```solidity
function increment(externalEuint32 value, bytes calldata proof) external {
    euint32 encryptedValue = FHE.fromExternal(value, proof);

    // For production: implement proper overflow checks
    // Example: use max value constant
    euint32 maxSafe = FHE.asEuint32(type(uint32).max - 1000);
    ebool wouldOverflow = FHE.gt(count, maxSafe);

    // Only increment if safe
    count = FHE.select(
        wouldOverflow,
        count,                            // Keep current if would overflow
        FHE.add(count, encryptedValue)   // Increment if safe
    );
}
```

**Note**: This contract simplifies overflow handling for readability. Production contracts should implement comprehensive checks.

## Anti-Pattern #8: Incorrect Permission Handling

### ❌ INCORRECT

```solidity
function updateBalance(externalEuint32 newBalance, bytes calldata proof) external {
    balances[msg.sender] = FHE.fromExternal(newBalance, proof);
    // ⚠️ Missing permissions - contract/user cannot use this value later
}
```

### ✅ CORRECT

```solidity
function updateBalance(externalEuint32 newBalance, bytes calldata proof) external {
    euint32 balance = FHE.fromExternal(newBalance, proof);
    balances[msg.sender] = balance;

    // Always grant permissions after creating encrypted values
    FHE.allowThis(balance);
    FHE.allow(balance, msg.sender);
}
```

## Anti-Pattern #9: Attempting Plaintext Comparison

### ❌ INCORRECT

```solidity
function checkThreshold(externalEuint32 value, bytes calldata proof) external view returns (bool) {
    euint32 encryptedValue = FHE.fromExternal(value, proof);

    // Cannot compare encrypted value with plaintext like this
    if (encryptedValue > 1000) {  // ⚠️ TYPE ERROR
        return true;
    }
    return false;
}
```

### ✅ CORRECT

```solidity
function checkThreshold(externalEuint32 value, bytes calldata proof) external returns (ebool) {
    euint32 encryptedValue = FHE.fromExternal(value, proof);

    // Use FHE.gt for encrypted comparison
    ebool isAboveThreshold = FHE.gt(encryptedValue, FHE.asEuint32(1000));

    FHE.allow(isAboveThreshold, msg.sender);
    return isAboveThreshold;
}
```

## Summary Checklist

When working with FHEVM, always:

✅ **Grant Both Permissions**: `FHE.allowThis()` and `FHE.allow()`
✅ **Include Input Proofs**: All `FHE.fromExternal()` calls need proofs
✅ **Match Signers**: Input creator must be transaction sender
✅ **Use FHE Operations**: Never mix plaintext and ciphertext directly
✅ **Use FHE.select**: For conditional logic on encrypted values
✅ **Consider Overflow**: Implement appropriate range checks
✅ **Avoid View Returns**: Don't return encrypted values from view functions
✅ **Test Thoroughly**: Use the fhevm mock for comprehensive testing

## Further Reading

- [Access Control Guide](access-control.md)
- [Permission Management](permissions.md)
- [Input Proofs Explanation](input-proofs.md)
- [Handle Lifecycle](handle-lifecycle.md)

---

**Remember**: Traditional smart contract patterns don't always apply to FHEVM. When in doubt, consult the test suite for working examples!
