#!/usr/bin/env ts-node
/**
 * @title Generate FHEVM Documentation
 * @notice Auto-generates GitBook-compatible documentation from code
 * @dev Usage: ts-node generate-docs.ts [example-name] [--all]
 *
 * This script:
 * 1. Extracts code and tests for specified example
 * 2. Generates formatted markdown files
 * 3. Creates SUMMARY.md for GitBook navigation
 * 4. Organizes docs by category
 * 5. Includes code examples and explanations
 */

import * as fs from "fs";
import * as path from "path";

interface DocConfig {
  name: string;
  title: string;
  description: string;
  contractFile: string;
  testFile: string;
  category: string;
}

// Documentation configuration for examples
const DOCS_CONFIG: { [key: string]: DocConfig } = {
  "private-artist-income-analyzer": {
    name: "private-artist-income-analyzer",
    title: "Private Artist Income Analyzer",
    description:
      "Privacy-preserving smart contract demonstrating encrypted income data aggregation using FHE",
    contractFile: "PrivateArtistIncomeAnalyzer.sol",
    testFile: "PrivateArtistIncomeAnalyzer.ts",
    category: "privacy",
  },
};

/**
 * Display usage information
 */
function showHelp(): void {
  console.log(`
FHEVM Documentation Generator
Usage: ts-node generate-docs.ts [example-name] [options]

Options:
  --all              Generate documentation for all examples
  --help             Show this help message

Examples:
  # Generate docs for specific example
  ts-node generate-docs.ts private-artist-income-analyzer

  # Generate docs for all examples
  ts-node generate-docs.ts --all

  # Show help
  ts-node generate-docs.ts --help
`);
}

/**
 * Extract contract code with syntax highlighting
 */
function extractContractCode(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return `\`\`\`solidity
${content}
\`\`\``;
}

/**
 * Extract test code with syntax highlighting
 */
function extractTestCode(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return `\`\`\`typescript
${content}
\`\`\``;
}

/**
 * Generate documentation markdown for an example
 */
function generateExampleDoc(config: DocConfig, projectRoot: string): string {
  const contractPath = path.join(projectRoot, "contracts", config.contractFile);
  const testPath = path.join(projectRoot, "test", config.testFile);

  const contractCode = extractContractCode(contractPath);
  const testCode = extractTestCode(testPath);

  return `# ${config.title}

## Overview

${config.description}

## Smart Contract

### Implementation

${contractCode}

## Test Suite

### Usage Examples

${testCode}

## Key Features

### 1. Privacy Preservation
- Encrypted data storage on-chain
- No plaintext exposure to contract logic
- User-controlled access permissions

### 2. Access Control
- Role-based authorization (owner, analysts)
- Function-level permission checks
- Modifiers for access enforcement

### 3. Encrypted Computation
- FHE operations on encrypted values
- Secure aggregation of encrypted data
- Confidential analytics generation

## Running Tests

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Deployment

### Local Development

\`\`\`bash
npm run deploy:localhost
\`\`\`

### Sepolia Testnet

\`\`\`bash
npm run deploy:sepolia
\`\`\`

## Common Patterns

### 1. Registering with Anonymous Identifier

\`\`\`solidity
function registerArtist(string calldata artistId) external {
    require(!artistProfiles[msg.sender].isActive, "Already registered");
    require(bytes(artistId).length > 0, "Invalid artist ID");

    artistProfiles[msg.sender] = ArtistProfile({
        artistId: artistId,
        totalIncome: FHE.asEuint64(0),
        // ... other fields
        isActive: true
    });

    emit ArtistRegistered(msg.sender, artistId);
}
\`\`\`

### 2. Submitting Encrypted Data

\`\`\`solidity
function submitIncomeData(
    uint64 totalIncome,
    uint32 artworksSold
) external onlyRegisteredArtist {
    euint64 encryptedIncome = FHE.asEuint64(totalIncome);
    euint32 encryptedArtworks = FHE.asEuint32(artworksSold);

    artistProfiles[msg.sender].totalIncome = encryptedIncome;
    artistProfiles[msg.sender].artworksSold = encryptedArtworks;

    FHE.allowThis(encryptedIncome);
    FHE.allow(encryptedIncome, msg.sender);
}
\`\`\`

### 3. Aggregate Computation

\`\`\`solidity
function generateIncomeAnalysis() external onlyAuthorized {
    euint64 totalIncome = FHE.asEuint64(0);

    for (uint i = 0; i < registeredArtists.length; i++) {
        totalIncome = FHE.add(
            totalIncome,
            artistProfiles[registeredArtists[i]].totalIncome
        );
    }

    // Store encrypted aggregate
    report.totalPlatformIncome = totalIncome;
    FHE.allowThis(totalIncome);
}
\`\`\`

## Best Practices

✅ **DO:**
- Always call \`FHE.allowThis()\` for contract permissions
- Always call \`FHE.allow()\` for user permissions
- Include comprehensive access control modifiers
- Document FHE-specific behavior in code comments
- Test with the hardhat mock environment first

❌ **DON'T:**
- Return encrypted values from view functions without permissions
- Skip input proof validation
- Assume plaintext behavior applies to encrypted values
- Use encrypted bools directly in if statements
- Forget to grant permissions before operations

## Troubleshooting

### Issue: Tests fail with "View functions cannot return encrypted values"
**Solution**: Don't return encrypted values from view functions. Use async decryption instead.

### Issue: "Missing FHE.allowThis() permissions"
**Solution**: Always grant both permissions:
\`\`\`solidity
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
\`\`\`

### Issue: Input proof validation fails
**Solution**: Ensure the signer creating the encrypted input matches the transaction sender.

## Learning Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **FHE Concepts**: https://docs.zama.ai/fhevm/concepts
- **Developer Guide**: https://docs.zama.ai/fhevm/developers
- **Hardhat Integration**: https://docs.zama.ai/fhevm/hardhat

## Next Steps

1. Modify the contract for your use case
2. Update tests to match new functionality
3. Run comprehensive testing: \`npm run test\`
4. Deploy to testnet: \`npm run deploy:sepolia\`
5. Verify contract on Etherscan: \`npm run verify:sepolia\`

---

Built with FHEVM by Zama
`;
}

/**
 * Generate SUMMARY.md for GitBook
 */
function generateSummary(configs: DocConfig[]): string {
  let summary = `# Documentation Summary

## Introduction
- [Getting Started](introduction.md)
- [Quick Start](quick-start.md)

## Examples

`;

  // Group by category
  const byCategory: { [key: string]: DocConfig[] } = {};
  configs.forEach((config) => {
    if (!byCategory[config.category]) {
      byCategory[config.category] = [];
    }
    byCategory[config.category].push(config);
  });

  // Generate sections
  Object.entries(byCategory).forEach(([category, items]) => {
    summary += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    items.forEach((config) => {
      const docName = config.name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
      summary += `- [${config.title}](${docName}.md)\n`;
    });
    summary += "\n";
  });

  summary += `
## Concepts
- [Fully Homomorphic Encryption](fhe-concepts.md)
- [Access Control](access-control.md)
- [Common Pitfalls](anti-patterns.md)

## Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Community](https://www.zama.ai/community)
`;

  return summary;
}

/**
 * Generate documentation files
 */
async function generateDocs(exampleName: string, projectRoot: string): Promise<void> {
  if (!DOCS_CONFIG[exampleName]) {
    console.error(`❌ Example '${exampleName}' not found`);
    process.exit(1);
  }

  const config = DOCS_CONFIG[exampleName];

  console.log(`\n📖 Generating documentation for ${config.title}...`);

  // Ensure docs directory exists
  const docsDir = path.join(projectRoot, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate example documentation
  const docContent = generateExampleDoc(config, projectRoot);
  const docFileName = `${exampleName}.md`;
  fs.writeFileSync(path.join(docsDir, docFileName), docContent, "utf-8");

  console.log(`✅ Generated: ${docFileName}`);
}

/**
 * Generate all documentation
 */
async function generateAllDocs(projectRoot: string): Promise<void> {
  console.log("\n📖 Generating all documentation...");

  const docsDir = path.join(projectRoot, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate docs for each example
  for (const [exampleName, config] of Object.entries(DOCS_CONFIG)) {
    const docContent = generateExampleDoc(config, projectRoot);
    const docFileName = `${exampleName}.md`;
    fs.writeFileSync(path.join(docsDir, docFileName), docContent, "utf-8");
    console.log(`✅ Generated: ${docFileName}`);
  }

  // Generate summary
  const summary = generateSummary(Object.values(DOCS_CONFIG));
  fs.writeFileSync(path.join(docsDir, "SUMMARY.md"), summary, "utf-8");
  console.log("✅ Generated: SUMMARY.md");

  console.log("\n📚 Documentation generated successfully!");
  console.log(`📍 Location: ${docsDir}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle help
  if (args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  const projectRoot = path.dirname(path.dirname(__filename));

  // Handle --all
  if (args.includes("--all")) {
    await generateAllDocs(projectRoot);
    return;
  }

  // Generate specific example
  const exampleName = args[0];

  if (!exampleName) {
    showHelp();
    process.exit(1);
  }

  try {
    await generateDocs(exampleName, projectRoot);
    console.log("\n✅ Documentation generated successfully!");
    console.log(`📍 Location: ${path.join(projectRoot, "docs")}\n`);
  } catch (error) {
    console.error("❌ Error generating documentation:", error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
