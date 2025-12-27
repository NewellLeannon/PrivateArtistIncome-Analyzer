# Deployment Guide

Complete guide for deploying Private Artist Income Analyzer to different networks.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Sepolia Testnet](#sepolia-testnet)
4. [Mainnet](#mainnet)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- Node.js v20 or higher
- npm v7 or higher
- MetaMask or Web3 wallet
- Testnet ETH (for Sepolia)

### Optional

- Hardhat (local development)
- Solhint (contract linting)
- OpenZeppelin CLI (contract management)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile contracts**:
   ```bash
   npm run compile
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**:
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

---

## Local Development

### Start Local Node

```bash
npx hardhat node
```

This starts a local Hardhat network on `http://localhost:8545`.

### Deploy to Local Network

In another terminal:

```bash
npm run deploy:localhost
```

### Using Hardhat Console

```bash
npx hardhat console --network localhost

# In console:
const analyzer = await ethers.getContractAt("PrivateArtistIncomeAnalyzer", "0x...");
const stats = await analyzer.getPlatformStats();
console.log(stats);
```

### Testing Locally

```bash
# Run all tests
npm run test

# Run specific test
npx hardhat test test/PrivateArtistIncomeAnalyzer.ts

# With coverage
npm run coverage
```

---

## Sepolia Testnet

### Network Information

- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_KEY
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepolia-faucet.pk910.de

### Get Testnet ETH

1. Visit Sepolia faucet
2. Enter wallet address
3. Request ETH (typical: 0.1 - 1 ETH)

### Configure Environment

1. **Set up variables**:
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

2. **Verify in `hardhat.config.ts`**:
   ```typescript
   sepolia: {
     url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
     accounts: {
       mnemonic: MNEMONIC,
     },
   }
   ```

### Deploy

```bash
npm run deploy:sepolia
```

Expected output:
```
Deploying PrivateArtistIncomeAnalyzer...
PrivateArtistIncomeAnalyzer deployed to: 0x...
✅ Deployment successful!
```

### Verify Deployment

1. **On Sepolia Etherscan**:
   - Visit: https://sepolia.etherscan.io
   - Search for contract address
   - Verify bytecode matches

2. **Programmatically**:
   ```bash
   npx hardhat run scripts/verify.ts --network sepolia
   ```

### Interact with Deployed Contract

```bash
npx hardhat console --network sepolia

# In console:
const analyzer = await ethers.getContractAt(
  "PrivateArtistIncomeAnalyzer",
  "0x..." // Your contract address
);

// Register artist
await analyzer.registerArtist("my_artist_id");

// Check stats
const stats = await analyzer.getPlatformStats();
console.log("Total Artists:", stats.totalArtistsCount.toString());
```

---

## Mainnet

### ⚠️ Important Warnings

1. **Test thoroughly** on Sepolia first
2. **Verify contract** before mainnet deployment
3. **Use hardware wallet** for mainnet keys
4. **Start small** - deploy to test network first
5. **Have audit** before production use

### Prerequisites for Mainnet

- Mainnet ETH for gas
- Proper contract audit
- Security review completed
- Comprehensive testing done

### Get Mainnet ETH

1. Purchase ETH from exchange
2. Transfer to deployment wallet
3. Verify balance: `npx hardhat accounts --network mainnet`

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

### Monitor Deployment

1. **View on Etherscan**:
   - https://etherscan.io
   - Search contract address

2. **Monitor gas usage**:
   ```bash
   REPORT_GAS=true npm run deploy:mainnet
   ```

---

## Verification

### Verify on Etherscan

After deployment, verify the source code:

```bash
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

### Manual Verification

1. Get deployment arguments
2. Visit Etherscan: https://etherscan.io/verifyContract
3. Enter contract address
4. Select compiler version: 0.8.24
5. Upload source code
6. Verify

### Check Deployment

```bash
# Get contract info
npx hardhat run scripts/check-deployment.ts --network sepolia

# Verify contract at address
npx hardhat verify --network sepolia <ADDRESS>
```

---

## Troubleshooting

### Issue: "Insufficient funds"

**Solution**:
- Add more ETH to account
- Reduce gas price (if safe)
- Use different account

### Issue: "Contract already exists"

**Solution**:
- Deploy to different address
- Use new account
- Check deployment history

### Issue: "Unknown network"

**Solution**:
- Check network name in hardhat.config.ts
- Verify RPC URL is correct
- Test RPC connection

### Issue: "Invalid private key"

**Solution**:
- Check MNEMONIC in .env
- Regenerate keys: `npx hardhat vars set MNEMONIC`
- Don't commit private keys to git

### Issue: "Compilation failed"

**Solution**:
```bash
npm run clean
npm install
npm run compile
```

### Issue: "Gas estimation failed"

**Solution**:
- Increase gas limit in hardhat.config.ts
- Check contract for infinite loops
- Verify function logic

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Contract verified on Etherscan
- [ ] Contract address documented
- [ ] Deployment transaction saved
- [ ] Team notified
- [ ] Monitoring setup
- [ ] Incident response plan ready
- [ ] Backup of ABI and deployment config
- [ ] Access control configured

---

## Monitoring

### Set Up Monitoring

1. **Contract Events**:
   ```bash
   npx hardhat watch-events PrivateArtistIncomeAnalyzer
   ```

2. **Gas Usage**:
   - Monitor on Etherscan
   - Track historical trends
   - Identify optimization opportunities

3. **Function Calls**:
   - Log all transactions
   - Monitor access patterns
   - Alert on anomalies

### Regular Maintenance

1. **Weekly**:
   - Review transaction logs
   - Check for errors
   - Monitor gas usage

2. **Monthly**:
   - Performance review
   - Security audit
   - Update dependencies

3. **Quarterly**:
   - Full system review
   - Security assessment
   - Upgrade evaluation

---

## Resources

- **Hardhat Docs**: https://hardhat.org/getting-started
- **Etherscan**: https://etherscan.io
- **Sepolia Faucet**: https://sepolia-faucet.pk910.de
- **Gas Tracker**: https://www.gasprice.io

---

**Deployment successful? Time to celebrate!** 🎉

For questions, check the main [README.md](README.md) or [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).
