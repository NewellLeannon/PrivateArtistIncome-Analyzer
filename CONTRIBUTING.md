# Contributing to Private Artist Income Analyzer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Make sure the bug hasn't been reported
2. **Create a detailed report** including:
   - Clear, descriptive title
   - Step-by-step reproduction
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Relevant code snippets

### Suggesting Enhancements

1. **Check existing discussions** - Your idea might already be discussed
2. **Provide detailed description**:
   - Clear use case and motivation
   - Examples of similar features
   - Potential implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Follow existing code style
   - Add/update tests
   - Update documentation

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: brief description of changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**:
   - Clear title and description
   - Link related issues
   - Explain changes and motivation

## Development Setup

### Prerequisites
- Node.js v20 or higher
- npm v7 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/private-artist-income-analyzer.git
cd private-artist-income-analyzer

# Install dependencies
npm install

# Verify setup
npm run compile
npm run test
```

### Development Workflow

1. **Compile contracts**:
   ```bash
   npm run compile
   ```

2. **Run tests**:
   ```bash
   npm run test
   ```

3. **Check code quality**:
   ```bash
   npm run lint
   npm run prettier:check
   ```

4. **Auto-format code**:
   ```bash
   npm run prettier:write
   ```

## Adding New Examples

### For New FHEVM Contracts

1. **Create contract** in appropriate directory:
   ```
   contracts/[category]/YourExample.sol
   ```

2. **Add comprehensive comments**:
   - `@title` - Contract title
   - `@notice` - What it does
   - `@dev` - Implementation details
   - `@param` - Parameter descriptions

3. **Create tests** in:
   ```
   test/[category]/YourExample.ts
   ```

4. **Include test cases**:
   - Success cases
   - Failure cases
   - Edge cases
   - Permission validation

5. **Update example catalog**:
   - Add to `scripts/create-fhevm-example.ts`
   - Add to `scripts/generate-docs.ts`

6. **Document the example**:
   - Add to `docs/examples/`
   - Update `docs/SUMMARY.md`
   - Add to `CATEGORIES.md`

### Testing Your Example

```bash
# Compile
npm run compile

# Run your tests
npx hardhat test test/[category]/YourExample.ts

# Generate coverage
npm run coverage
```

### Documentation

Document your changes in:
- Inline code comments
- `README.md` if needed
- `CATEGORIES.md` for new categories
- Create `.md` file in `docs/` for detailed guide

## Code Standards

### Solidity

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";

/// @title Clear Contract Name
/// @notice What this contract does
/// @dev Implementation details
contract YourContract {
    /// @notice Clear function documentation
    /// @param param1 Description of param1
    /// @return Description of return value
    function yourFunction(uint32 param1) external returns (uint32) {
        // Implementation
    }
}
```

### TypeScript/Tests

```typescript
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("YourContract", function () {
  // Clear test organization and naming
  it("should [expected behavior]", async function () {
    // Arrange
    // Act
    // Assert
  });
});
```

### Formatting

We use Prettier and ESLint for code formatting:

```bash
# Check formatting
npm run prettier:check
npm run lint

# Auto-fix
npm run prettier:write
```

## Review Process

When you submit a PR:

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Feedback** provided if changes needed
4. **Approval** and merge when ready

## Testing Requirements

All contributions must include:

- ✅ Updated or new tests
- ✅ Test coverage for new code
- ✅ All tests passing locally
- ✅ No breaking changes to existing tests

Run tests locally:

```bash
npm run test
npm run coverage
```

## Documentation Requirements

- ✅ Code comments for complex logic
- ✅ Function documentation with JSDoc
- ✅ Updated README if needed
- ✅ Update CATEGORIES.md for new examples
- ✅ Create/update docs in `docs/` directory

## Git Commit Messages

Follow this format:

```
type(scope): subject

Body with detailed explanation if needed.

Fixes #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Build, dependencies, etc.

## Questions?

- **Documentation**: Check `docs/` directory
- **Issues**: Search existing issues
- **Discussion**: Create a discussion or comment on existing PR
- **Community**: Join Zama Discord

## Recognition

Contributors will be recognized in:
- Pull request comments
- Release notes
- Contributors list

Thank you for contributing! 🎉
