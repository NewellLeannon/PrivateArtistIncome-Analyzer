# FHEVM Hardhat Base Template

This is the base template for FHEVM (Fully Homomorphic Encryption Virtual Machine) smart contract development using Hardhat.

## Quick Start

```bash
npm install
npm run compile
npm run test
```

## Features

- ✅ Hardhat configuration for FHEVM
- ✅ TypeScript support
- ✅ Example FHE counter contract
- ✅ Comprehensive test suite
- ✅ Deployment scripts
- ✅ Linting and formatting

## Project Structure

```
base-template/
├── contracts/
│   └── FHECounter.sol       # Example FHE contract
├── test/
│   └── FHECounter.ts        # Test suite
├── deploy/
│   └── deploy.ts            # Deployment script
├── hardhat.config.ts        # Hardhat configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy

```bash
# Local
npm run deploy:localhost

# Sepolia testnet
npm run deploy:sepolia
```

## Using This Template

This template can be used as a starting point for FHEVM projects. Copy it and modify the contracts to fit your use case.

## Resources

- FHEVM Documentation: https://docs.zama.ai/fhevm
- Hardhat Documentation: https://hardhat.org

## License

BSD-3-Clause-Clear
