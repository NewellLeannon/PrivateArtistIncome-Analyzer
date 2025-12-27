#!/usr/bin/env ts-node
/**
 * @title Create FHEVM Example Repository
 * @notice Generates standalone FHEVM example repositories from the example hub
 * @dev Usage: ts-node create-fhevm-example.ts <example-name> <output-path>
 *
 * This script:
 * 1. Clones/copies the base Hardhat template
 * 2. Copies the contract and test files for the specified example
 * 3. Generates a README with setup instructions
 * 4. Updates package.json with proper metadata
 * 5. Creates deployment scripts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleConfig {
  name: string;
  contractFile: string;
  testFile: string;
  description: string;
  category: "basic" | "auctions" | "openzeppelin" | "games" | "privacy";
}

// Examples catalog - can be extended with more examples
const EXAMPLES: { [key: string]: ExampleConfig } = {
  "private-artist-income-analyzer": {
    name: "Private Artist Income Analyzer",
    contractFile: "PrivateArtistIncomeAnalyzer.sol",
    testFile: "PrivateArtistIncomeAnalyzer.ts",
    description:
      "Privacy-preserving artist income analysis using encrypted computation on blockchain",
    category: "privacy",
  },
};

/**
 * Display usage information
 */
function showHelp(): void {
  console.log(`
FHEVM Example Repository Generator
Usage: ts-node create-fhevm-example.ts <example-name> [output-path]

Available examples:
${Object.keys(EXAMPLES)
  .map((key) => `  - ${key}`)
  .join("\n")}

Examples:
  # Generate example to current directory
  ts-node create-fhevm-example.ts private-artist-income-analyzer ./my-example

  # Generate to specific path
  ts-node create-fhevm-example.ts private-artist-income-analyzer /path/to/output

Options:
  --help           Show this help message
  --list           List available examples
`);
}

/**
 * List available examples
 */
function listExamples(): void {
  console.log("\nAvailable Examples:\n");
  Object.entries(EXAMPLES).forEach(([key, config]) => {
    console.log(`📦 ${key}`);
    console.log(`   Name: ${config.name}`);
    console.log(`   Category: ${config.category}`);
    console.log(`   Description: ${config.description}\n`);
  });
}

/**
 * Validate example exists
 */
function validateExample(exampleName: string): ExampleConfig | null {
  if (!EXAMPLES[exampleName]) {
    console.error(`❌ Example '${exampleName}' not found`);
    console.error(`\nUse --list to see available examples`);
    return null;
  }
  return EXAMPLES[exampleName];
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy file with template substitution
 */
function copyFile(src: string, dest: string, replacements?: { [key: string]: string }): void {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source file not found: ${src}`);
    return;
  }

  let content = fs.readFileSync(src, "utf-8");

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, "g"), value);
    });
  }

  fs.writeFileSync(dest, content, "utf-8");
}

/**
 * Generate README for the example
 */
function generateReadme(example: ExampleConfig, outputDir: string): void {
  const readme = `# ${example.name}

## Overview

${example.description}

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Compile the Contract

\`\`\`bash
npm run compile
\`\`\`

### 3. Run Tests

\`\`\`bash
npm run test
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/
│   └── ${example.contractFile}
├── test/
│   └── ${example.testFile}
├── hardhat.config.ts
├── package.json
└── tsconfig.json
\`\`\`

## Available Scripts

- \`npm run compile\` - Compile Solidity contracts
- \`npm run test\` - Run test suite
- \`npm run deploy:localhost\` - Deploy to local network
- \`npm run deploy:sepolia\` - Deploy to Sepolia testnet
- \`npm run lint\` - Run linter and formatter checks

## Testing

The contract includes comprehensive tests demonstrating:

- ✅ Correct usage patterns
- ✅ Permission management
- ✅ Edge cases and error conditions
- ✅ Privacy guarantees

Run tests with:
\`\`\`bash
npm run test
\`\`\`

## Key Concepts

This example demonstrates important FHEVM patterns:

1. **Encrypted Types**: Working with euint32 and euint64
2. **FHE Operations**: Addition, comparison on encrypted values
3. **Access Control**: Permission management with FHE.allowThis() and FHE.allow()
4. **Input Proofs**: Validating encrypted inputs from external sources

## Deployment

### Local Testing

\`\`\`bash
npm run chain  # In terminal 1
npm run deploy:localhost  # In terminal 2
\`\`\`

### Sepolia Testnet

1. Set up environment variables:
\`\`\`bash
export MNEMONIC="your mnemonic here"
export INFURA_API_KEY="your infura key"
\`\`\`

2. Deploy:
\`\`\`bash
npm run deploy:sepolia
\`\`\`

## Documentation

For detailed documentation, refer to the main project repository.

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org
- **Zama Community**: https://www.zama.ai/community

## License

BSD-3-Clause-Clear

---

Built with FHEVM by Zama
`;

  fs.writeFileSync(path.join(outputDir, "README.md"), readme, "utf-8");
}

/**
 * Generate package.json for the example
 */
function generatePackageJson(example: ExampleConfig, outputDir: string): void {
  const packageJson = {
    name: example.name.toLowerCase().replace(/\\s+/g, "-"),
    version: "1.0.0",
    description: example.description,
    license: "BSD-3-Clause-Clear",
    engines: {
      node: ">=20",
      npm: ">=7.0.0",
    },
    scripts: {
      clean: 'rimraf ./fhevmTemp ./artifacts ./cache ./coverage ./types ./coverage.json ./dist && npm run typechain',
      compile: "cross-env TS_NODE_TRANSPILE_ONLY=true hardhat compile",
      test: "hardhat test",
      "test:sepolia": "hardhat test --network sepolia",
      "deploy:localhost": "hardhat deploy --network localhost",
      "deploy:sepolia": "hardhat deploy --network sepolia",
      lint: "npm run lint:sol && npm run lint:ts",
      "lint:sol": 'solhint --max-warnings 0 "contracts/**/*.sol"',
      "lint:ts": 'eslint --ignore-path ./.eslintignore --ext .js,.ts .',
      typechain: "cross-env TS_NODE_TRANSPILE_ONLY=true hardhat typechain",
    },
    dependencies: {
      "encrypted-types": "^0.0.4",
      "@fhevm/solidity": "^0.9.1",
    },
    devDependencies: {
      "@fhevm/hardhat-plugin": "^0.3.0-1",
      "@nomicfoundation/hardhat-chai-matchers": "^2.1.0",
      "@nomicfoundation/hardhat-ethers": "^3.1.0",
      "@nomicfoundation/hardhat-network-helpers": "^1.1.0",
      "@nomicfoundation/hardhat-verify": "^2.1.0",
      "@typechain/ethers-v6": "^0.5.1",
      "@typechain/hardhat": "^9.1.0",
      "@types/chai": "^4.3.20",
      "@types/mocha": "^10.0.10",
      "@types/node": "^20.19.8",
      "@typescript-eslint/eslint-plugin": "^8.37.0",
      "@typescript-eslint/parser": "^8.37.0",
      "@zama-fhe/relayer-sdk": "^0.3.0-5",
      chai: "^4.5.0",
      "chai-as-promised": "^8.0.1",
      "cross-env": "^7.0.3",
      eslint: "^8.57.1",
      "eslint-config-prettier": "^9.1.0",
      ethers: "^6.15.0",
      hardhat: "^2.26.0",
      "hardhat-deploy": "^0.11.45",
      "hardhat-gas-reporter": "^2.3.0",
      mocha: "^11.7.1",
      prettier: "^3.6.2",
      "prettier-plugin-solidity": "^2.1.0",
      rimraf: "^6.0.1",
      solhint: "^6.0.0",
      "solidity-coverage": "^0.8.16",
      "ts-node": "^10.9.2",
      typechain: "^8.3.2",
      typescript: "^5.8.3",
    },
  };

  fs.writeFileSync(path.join(outputDir, "package.json"), JSON.stringify(packageJson, null, 2), "utf-8");
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle help
  if (args.includes("--help") || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  // Handle list
  if (args.includes("--list")) {
    listExamples();
    process.exit(0);
  }

  const exampleName = args[0];
  const outputPath = args[1] || `./${exampleName}`;

  // Validate example
  const example = validateExample(exampleName);
  if (!example) {
    process.exit(1);
  }

  console.log(`\n📦 Generating ${example.name}...`);
  console.log(`📍 Output: ${path.resolve(outputPath)}\n`);

  try {
    // Create output directory
    ensureDir(outputPath);

    // Create subdirectories
    ensureDir(path.join(outputPath, "contracts"));
    ensureDir(path.join(outputPath, "test"));
    ensureDir(path.join(outputPath, "deploy"));
    ensureDir(path.join(outputPath, ".github/workflows"));

    // Get source paths
    const projectRoot = path.dirname(path.dirname(__filename));
    const contractSrc = path.join(projectRoot, "contracts", example.contractFile);
    const testSrc = path.join(projectRoot, "test", example.testFile);

    // Copy files
    console.log("📋 Copying contract...");
    copyFile(contractSrc, path.join(outputPath, "contracts", example.contractFile));

    console.log("📋 Copying tests...");
    copyFile(testSrc, path.join(outputPath, "test", example.testFile));

    // Copy configuration files
    console.log("📋 Copying configuration files...");
    copyFile(path.join(projectRoot, "hardhat.config.ts"), path.join(outputPath, "hardhat.config.ts"));
    copyFile(path.join(projectRoot, "tsconfig.json"), path.join(outputPath, "tsconfig.json"));
    copyFile(path.join(projectRoot, ".prettierrc.yml"), path.join(outputPath, ".prettierrc.yml"));
    copyFile(path.join(projectRoot, ".prettierignore"), path.join(outputPath, ".prettierignore"));
    copyFile(path.join(projectRoot, ".eslintrc.yml"), path.join(outputPath, ".eslintrc.yml"));
    copyFile(path.join(projectRoot, ".eslintignore"), path.join(outputPath, ".eslintignore"));

    // Generate package.json
    console.log("📦 Generating package.json...");
    generatePackageJson(example, outputPath);

    // Generate README
    console.log("📖 Generating README...");
    generateReadme(example, outputPath);

    // Create .gitignore
    const gitignore = `node_modules/
.env
.env.local
.env.*.local
artifacts/
cache/
fhevmTemp/
coverage/
coverage.json
dist/
types/
*.log
.DS_Store
`;
    fs.writeFileSync(path.join(outputPath, ".gitignore"), gitignore, "utf-8");

    console.log("✅ Repository generated successfully!\n");
    console.log("📖 Next steps:\n");
    console.log(`  cd ${outputPath}`);
    console.log(`  npm install`);
    console.log(`  npm run compile`);
    console.log(`  npm run test\n`);
  } catch (error) {
    console.error("❌ Error generating repository:", error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
