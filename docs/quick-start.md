# Quick Start Guide

## Prerequisites

- Node.js v20 or higher
- npm v7 or higher
- Basic understanding of Solidity and JavaScript
- MetaMask or compatible Web3 wallet

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Generate TypeChain types
npm run typechain
```

### 2. Compile the Contract

```bash
npm run compile
```

You should see output like:
```
Compiled 1 Solidity file successfully
Generated 5 TypeChain files
```

### 3. Run Tests

```bash
npm run test
```

Expected output:
```
PrivateArtistIncomeAnalyzer
  Deployment
    ✓ should set the correct owner
    ✓ should initialize totalArtists to 0
    ...

30 passing
```

## Using with Hardhat Console

### Start Hardhat Console

```bash
npx hardhat console
```

### Deploy Contract

```javascript
const artistAnalyzer = await ethers.deployContract("PrivateArtistIncomeAnalyzer");
await artistAnalyzer.waitForDeployment();
const address = await artistAnalyzer.getAddress();
console.log("Deployed to:", address);
```

### Register Artist

```javascript
const [deployer, alice] = await ethers.getSigners();
const tx = await artistAnalyzer.connect(alice).registerArtist("alice_artist_001");
await tx.wait();
console.log("Artist registered");
```

### Submit Encrypted Income Data

```javascript
// Note: In hardhat console, encryption requires additional setup
// For full example, see test/PrivateArtistIncomeAnalyzer.ts

const tx = await artistAnalyzer.connect(alice).submitIncomeData(
  ethers.parseEther("50"),      // totalIncome
  25,                             // artworksSold
  2000,                          // averagePrice
  5000,                          // royaltyEarnings
  10000                          // commissionEarnings
);
await tx.wait();
console.log("Income data submitted");
```

## Common Tasks

### Check Artist Registration

```javascript
const isRegistered = await artistAnalyzer.isRegisteredArtist(alice.address);
console.log("Is registered:", isRegistered);
```

### Get Platform Statistics

```javascript
const stats = await artistAnalyzer.getPlatformStats();
console.log("Total artists:", stats.totalArtistsCount);
console.log("Session ID:", stats.currentSessionId);
```

### Generate Income Analysis

```javascript
// Authorize yourself as analyst first
await artistAnalyzer.authorizeAnalyst(deployer.address);

// Generate analysis
const tx = await artistAnalyzer.generateIncomeAnalysis();
await tx.wait();
console.log("Analysis generated");
```

## Running Specific Tests

### Test Artist Registration

```bash
npx hardhat test --grep "Artist Registration"
```

### Test Income Submission

```bash
npx hardhat test --grep "Income Data Submission"
```

### Full Test Report

```bash
npm run test
```

## Deployment to Sepolia

### 1. Configure Environment

Create `.env.local`:
```
MNEMONIC="your mnemonic here"
INFURA_API_KEY="your infura key"
ETHERSCAN_API_KEY="your etherscan key"
```

### 2. Deploy

```bash
npm run deploy:sepolia
```

### 3. Verify Contract

```bash
npm run verify:sepolia -- <contract_address> <constructor_args>
```

## Troubleshooting

### Compilation Errors

**Error**: `Cannot find module '@fhevm/solidity'`

**Solution**:
```bash
npm install --save @fhevm/solidity @fhevm/hardhat-plugin
npm run compile
```

### Test Failures

**Error**: `This hardhat test suite cannot run on Sepolia Testnet`

**Solution**: Tests are designed for the hardhat mock environment. Run tests locally:
```bash
npm run test
```

### TypeChain Generation Issues

**Error**: `Types not found in test files`

**Solution**: Regenerate TypeChain types:
```bash
npm run clean
npm run typechain
```

## Next Steps

1. **Read the Full Documentation**: Start with [Privacy Concepts](privacy-concepts.md)
2. **Explore the Smart Contract**: Review `contracts/PrivateArtistIncomeAnalyzer.sol`
3. **Study the Tests**: Check `test/PrivateArtistIncomeAnalyzer.ts` for usage patterns
4. **Try the Demo**: Visit the live platform at the GitHub repository
5. **Join the Community**: Connect with other developers building on FHEVM

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Smart Contract Guide**: https://docs.zama.ai/fhevm/guides/overview
- **Hardhat Documentation**: https://hardhat.org
- **Zama Community**: https://www.zama.ai/community

---

Questions? Check the [debugging tips](debugging.md) or reach out to the community!
