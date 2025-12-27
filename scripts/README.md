# Automation Tools Guide

This directory contains TypeScript-based automation tools for generating FHEVM example repositories and documentation.

## Overview

The automation toolkit provides three main capabilities:

1. **Repository Generation**: Create standalone FHEVM example projects
2. **Documentation Generation**: Auto-generate GitBook-compatible documentation
3. **Category Projects**: Build multi-example repositories

## Tools

### 1. create-fhevm-example.ts

Generates a complete standalone repository for a single FHEVM example.

**Usage:**

```bash
npm run create-example <example-name> [output-path]

# Example:
npm run create-example private-artist-income-analyzer ./my-example
```

**What It Does:**

1. Creates output directory structure
2. Copies contract and test files
3. Copies configuration files (hardhat.config.ts, tsconfig.json, etc.)
4. Generates package.json with proper dependencies
5. Creates README with setup instructions
6. Sets up .gitignore and other project files

**Output Structure:**

```
my-example/
├── contracts/
│   └── PrivateArtistIncomeAnalyzer.sol
├── test/
│   └── PrivateArtistIncomeAnalyzer.ts
├── hardhat.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

**Available Examples:**

Currently configured:
- `private-artist-income-analyzer` - Privacy-preserving artist income analytics

To add more examples, edit the `EXAMPLES` object in `create-fhevm-example.ts`:

```typescript
const EXAMPLES: { [key: string]: ExampleConfig } = {
  "your-example": {
    name: "Your Example",
    contractFile: "YourExample.sol",
    testFile: "YourExample.ts",
    description: "Description of your example",
    category: "basic",
  },
  // Add more examples...
};
```

**Generated Project Usage:**

```bash
cd my-example
npm install
npm run compile
npm run test
npm run deploy:localhost
```

---

### 2. create-fhevm-category.ts

Generates a project containing multiple examples from the same category.

**Usage:**

```bash
npm run create-category <category> [output-path]

# Example:
npm run create-category privacy ./privacy-examples
```

**Supported Categories:**

- `basic` - Basic FHE operations and concepts
- `privacy` - Privacy-preserving applications
- `auctions` - Auction examples
- `advanced` - Complex FHEVM patterns

**What It Does:**

1. Creates project structure for multiple examples
2. Copies all contracts in the category
3. Copies all corresponding tests
4. Generates unified deployment script
5. Creates comprehensive README
6. Sets up proper package.json

**Output Structure:**

```
privacy-examples/
├── contracts/
│   ├── PrivateArtistIncomeAnalyzer.sol
│   └── (other privacy examples)
├── test/
│   ├── PrivateArtistIncomeAnalyzer.ts
│   └── (other privacy tests)
├── package.json
├── hardhat.config.ts
└── README.md
```

**Benefits:**

- Learn multiple related concepts together
- Shared configuration and dependencies
- Easier testing of related examples
- Good for understanding FHEVM design patterns

---

### 3. generate-docs.ts

Auto-generates GitBook-compatible markdown documentation from code.

**Usage:**

```bash
# Generate docs for specific example
npm run generate-docs private-artist-income-analyzer

# Generate docs for all examples
npm run generate-docs --all

# Or use full command
ts-node scripts/generate-docs.ts private-artist-income-analyzer
ts-node scripts/generate-docs.ts --all
```

**What It Does:**

1. Extracts contract code with syntax highlighting
2. Extracts test code with examples
3. Generates formatted markdown files
4. Creates SUMMARY.md for GitBook navigation
5. Organizes docs by category
6. Includes key patterns and best practices

**Output Files:**

```
docs/
├── SUMMARY.md                              # Table of contents
├── private-artist-income-analyzer.md       # Example documentation
├── introduction.md                         # Getting started
├── fhe-overview.md                         # FHE concepts
└── anti-patterns.md                        # Common pitfalls
```

**GitBook Integration:**

The generated documentation is compatible with GitBook. To publish:

1. Copy `docs/` to your GitBook repository
2. Add `SUMMARY.md` to your GitBook
3. Configure in `book.json`:

```json
{
  "root": "./docs",
  "plugins": ["searchable-pdf"],
  "pluginsConfig": {
    "searchable-pdf": {
      "threshold": 6
    }
  }
}
```

**Customizing Documentation:**

Edit the `DOCS_CONFIG` object to customize:

```typescript
const DOCS_CONFIG: { [key: string]: DocConfig } = {
  "private-artist-income-analyzer": {
    name: "private-artist-income-analyzer",
    title: "Private Artist Income Analyzer",
    description: "Your description here",
    contractFile: "PrivateArtistIncomeAnalyzer.sol",
    testFile: "PrivateArtistIncomeAnalyzer.ts",
    category: "privacy",
  },
};
```

---

## Common Workflows

### Scenario 1: Create a Custom FHEVM Example

1. **Create your contract** in `contracts/MyExample.sol`
2. **Create tests** in `test/MyExample.ts`
3. **Add to examples catalog**:

```typescript
const EXAMPLES = {
  "my-example": {
    name: "My Example",
    contractFile: "MyExample.sol",
    testFile: "MyExample.ts",
    description: "What this example demonstrates",
    category: "privacy", // or "basic", "auctions", etc.
  },
};
```

4. **Generate standalone repository**:

```bash
npm run create-example my-example ./output
```

5. **Test it works**:

```bash
cd output
npm install && npm run test
```

### Scenario 2: Build a Learning Path

Create a category with related examples:

1. Add examples to category folder
2. Update `create-fhevm-category.ts` with category definition
3. Generate category project:

```bash
npm run create-category privacy ./privacy-learning-path
```

4. Users can learn all privacy patterns together

### Scenario 3: Generate Complete Documentation

1. Implement examples in main repository
2. Generate all documentation:

```bash
npm run generate-all-docs
```

3. Host on GitBook or GitHub Pages
4. Link from main README

---

## Extending the Tools

### Adding New Examples

1. Create contract: `contracts/YourExample.sol`
2. Create tests: `test/YourExample.ts`
3. Add to `EXAMPLES` in `create-fhevm-example.ts`
4. Run: `npm run create-example your-example ./test-output`

### Adding New Categories

1. Organize contracts into category folder
2. Add category definition to `create-fhevm-category.ts`:

```typescript
const CATEGORIES = {
  "your-category": {
    name: "Your Category",
    description: "Category description",
    examples: ["example1", "example2"],
  },
};
```

3. Generate: `npm run create-category your-category ./output`

### Customizing Generated Content

Edit template functions in each script:

- `generateReadme()` - Customize README output
- `generatePackageJson()` - Modify dependencies
- `generateExampleDoc()` - Change documentation format
- `generateSummary()` - Modify GitBook structure

---

## Troubleshooting

### Issue: "Cannot find module '@fhevm/solidity'"

**Solution**: Install dependencies in generated project:
```bash
cd generated-project
npm install
```

### Issue: "TypeScript compilation error"

**Solution**: Regenerate with proper TypeScript config:
```bash
npm run clean
npm run typechain
npm run compile
```

### Issue: "Script execution failed"

**Solution**: Ensure proper Node.js version:
```bash
node --version  # Should be v20 or higher
npm --version   # Should be v7 or higher
```

### Issue: "File not found when generating example"

**Solution**: Verify file paths in EXAMPLES config match actual files:
```bash
ls contracts/
ls test/
# Update EXAMPLES with correct filenames
```

---

## Development Tips

### Testing Script Changes

1. Make changes to `.ts` file
2. Run script directly with ts-node:

```bash
npx ts-node scripts/create-fhevm-example.ts --help
```

3. Check output in test directory
4. Verify generated project works:

```bash
cd test-output
npm install && npm run test
```

### Adding Script Features

1. Edit TypeScript file
2. Add new functions
3. Update interface definitions
4. Test with `ts-node`
5. Document in this README

### Version Control

For distributed scripts, consider:

```bash
# Commit source TypeScript
git add scripts/*.ts

# Ignore generated projects (usually in .gitignore)
echo "test-output/" >> .gitignore
```

---

## Performance Tips

- **First run slower**: ts-node compiles on first run
- **Subsequent runs faster**: TypeScript cache helps
- **Large projects**: Generating many examples takes time
- **Parallel generation**: Run scripts in separate terminals

---

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Guide**: https://hardhat.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **GitBook Documentation**: https://docs.gitbook.com

---

## Examples of Generated Projects

After running `create-fhevm-example.ts`, each generated project includes:

✅ Complete `package.json` with all FHEVM dependencies
✅ Hardhat configuration for Sepolia and local testing
✅ TypeScript setup with proper types
✅ ESLint and Prettier configuration
✅ Comprehensive README with examples
✅ Scripts for compile, test, and deploy
✅ .gitignore and .github/ workflows

This ensures every generated project is ready to:
- Compile immediately
- Run tests without errors
- Deploy to testnet or mainnet
- Extend with new contracts

---

**Questions?** Check the main [README.md](../README.md) or review the script source code.

Built with FHEVM by Zama
