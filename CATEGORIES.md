# FHEVM Example Categories

This document describes the organization of FHEVM examples by category for learning and reference.

## Category Structure

Examples are organized into the following categories:

### 1. Basic - Fundamental FHEVM Operations

Core operations and patterns for working with FHEVM.

**Examples:**

- **FHECounter** - Simple encrypted counter
  - Location: `contracts/PrivateArtistIncomeAnalyzer.sol`
  - Demonstrates: Increment/decrement on encrypted values
  - Key Concepts: euint32, FHE.add, FHE.sub, permissions

- **FHEAdd** - Addition on encrypted values
  - Location: `contracts/basic/FHEAdd.sol`
  - Demonstrates: Adding two encrypted values, adding plaintext to encrypted
  - Key Concepts: FHE.add, multiple encrypted inputs, accumulation

- **EncryptSingleValue** - Encrypting and storing single values
  - Location: `contracts/basic/EncryptSingleValue.sol`
  - Demonstrates: Input encryption, storage, permission management
  - Key Concepts: FHE.fromExternal, input proofs, encrypted storage

- **EqualityComparison** - Comparing encrypted values
  - Location: `contracts/basic/EqualityComparison.sol`
  - Demonstrates: Equality checks, encrypted conditionals
  - Key Concepts: FHE.eq, ebool, FHE.select

**Learning Path:**
1. Start with FHECounter for basic increment/decrement
2. Move to FHEAdd for multi-operand arithmetic
3. Study EncryptSingleValue for proper input handling
4. Learn EqualityComparison for conditional logic

### 2. Encryption - Data Encryption Patterns

Examples focusing on encrypting and handling encrypted inputs.

**Examples:**

- **EncryptSingleValue** (referenced above)
- **EncryptMultipleValues** (future example)
  - Multiple different encrypted values in single operation
  - Array handling with encrypted data

**Key Patterns:**
- Input proof validation
- Type conversion (external to internal)
- Permission management post-encryption

### 3. Decryption - Decryption Mechanisms

Examples showing different decryption approaches.

**Examples:**

- **UserDecryptSingleValue** (future example)
  - User-controlled decryption
  - Off-chain decryption key management

- **PublicDecryptAggregates** (referenced in main contract)
  - Async decryption through relayer
  - Aggregate result decryption

**Key Patterns:**
- User decryption workflow
- Relayer-based decryption
- Signature verification

### 4. Privacy - Privacy-Preserving Applications

Real-world applications demonstrating privacy preservation.

**Examples:**

- **PrivateArtistIncomeAnalyzer** (main contract)
  - Location: `contracts/PrivateArtistIncomeAnalyzer.sol`
  - Demonstrates: Complete privacy application
  - Key Concepts: Aggregate computation, multiple users, analytics

**Use Cases:**
- Income tracking
- Market research
- Confidential data sharing

### 5. AccessControl - Permission Management

Examples focusing on FHEVM's access control model.

**Examples:**

- **AccessControlPatterns** (future example)
  - FHE.allowThis() for contract permissions
  - FHE.allow() for user permissions
  - Role-based authorization

**Key Concepts:**
- Dual-permission model
- Modifier-based access control
- User-specific decryption rights

### 6. Advanced - Complex Patterns

Advanced use cases and optimization techniques.

**Examples:**

- **EncryptedAuctioning** (future example)
  - Sealed-bid auctions with encrypted bids

- **ConfidentialOracles** (future example)
  - Privacy-preserving data from external sources

**Key Concepts:**
- Complex business logic on encrypted data
- Optimization strategies
- Integration with other systems

## Organization by File

### Contracts Directory Structure

```
contracts/
├── PrivateArtistIncomeAnalyzer.sol    # Privacy category
├── basic/
│   ├── FHEAdd.sol                     # Basic category
│   ├── EncryptSingleValue.sol         # Encryption category
│   └── EqualityComparison.sol         # Basic category
├── encryption/
│   ├── EncryptMultipleValues.sol      # Encryption category
│   └── ... (future examples)
├── decryption/
│   ├── UserDecryptSingleValue.ts      # Decryption category
│   └── ... (future examples)
├── access-control/
│   └── AccessControlPatterns.sol      # AccessControl category
└── advanced/
    ├── BlindAuction.sol               # Advanced category
    └── ... (future examples)
```

### Test Directory Structure

Tests mirror the contracts directory:

```
test/
├── PrivateArtistIncomeAnalyzer.ts
├── basic/
│   ├── FHEAdd.ts
│   ├── EncryptSingleValue.ts
│   └── EqualityComparison.ts
├── encryption/
│   └── ...
├── decryption/
│   └── ...
├── access-control/
│   └── ...
└── advanced/
    └── ...
```

### Documentation by Category

```
docs/
├── introduction.md                     # Overview
├── quick-start.md                     # Setup guide
├── fhe-overview.md                    # Concepts
├── anti-patterns.md                   # Common mistakes
├── examples/                          # Category docs
│   ├── basic.md
│   ├── encryption.md
│   ├── decryption.md
│   ├── privacy.md
│   ├── access-control.md
│   └── advanced.md
└── SUMMARY.md                         # Navigation
```

## How to Add New Examples

### 1. Choose a Category

Determine which category your example belongs to based on its primary focus:
- **Basic**: Fundamental operations
- **Encryption**: Input encryption patterns
- **Decryption**: Decryption mechanisms
- **Privacy**: Real-world privacy applications
- **AccessControl**: Permission management
- **Advanced**: Complex patterns

### 2. Create Contract

Create the contract in the appropriate subdirectory:

```bash
# Create the contract file
touch contracts/<category>/YourExample.sol

# Write the contract with detailed comments
```

### 3. Create Tests

Create comprehensive tests:

```bash
# Create the test file
touch test/<category>/YourExample.ts

# Include: success cases, failure cases, edge cases
```

### 4. Update Examples Map

Update `scripts/create-fhevm-example.ts`:

```typescript
const EXAMPLES: { [key: string]: ExampleConfig } = {
  "your-example": {
    name: "Your Example Name",
    contractFile: "YourExample.sol",
    testFile: "YourExample.ts",
    description: "What this example demonstrates",
    category: "your-category", // basic, encryption, etc.
  },
};
```

### 5. Create Documentation

Add documentation in `docs/examples/<category>.md`:

```markdown
## Your Example Name

### Overview
[Description]

### Key Concepts
- [Concept 1]
- [Concept 2]

### Code Examples
[Code snippets]

### Testing
[How to test]

### Resources
[Links]
```

### 6. Update SUMMARY.md

Add entry to `docs/SUMMARY.md`:

```markdown
### Your Category
- [Your Example](examples/your-category.md#your-example-name)
```

## Recommended Learning Path

### Beginner

1. **FHECounter** - Start with basics
2. **EncryptSingleValue** - Understand encryption
3. **EqualityComparison** - Learn comparisons
4. **FHEAdd** - Multiple encrypted values

### Intermediate

5. **AccessControlPatterns** - Permission management
6. **Multiple value encryption** - Scaling up
7. **User decryption** - Accessing results

### Advanced

8. **PrivateArtistIncomeAnalyzer** - Complete application
9. **Complex auctions** - Real-world patterns
10. **Confidential oracles** - External data

## Migration Guide

When updating FHEVM library versions:

1. **Update base-template dependencies**
2. **Recompile all examples** - Flag any breaking changes
3. **Update examples** - Fix compatibility issues
4. **Update documentation** - Note version requirements
5. **Test thoroughly** - Run full test suite

## Category Statistics

### Basic Category
- Contracts: 3 (FHECounter, FHEAdd, EncryptSingleValue, EqualityComparison)
- Test Coverage: 15+ tests
- Complexity: Low
- Estimated Learning Time: 2-3 hours

### Encryption Category
- Contracts: 1+ (EncryptSingleValue, more planned)
- Test Coverage: 10+ tests
- Complexity: Medium
- Estimated Learning Time: 1-2 hours

### Privacy Category
- Contracts: 1 (PrivateArtistIncomeAnalyzer)
- Test Coverage: 30+ tests
- Complexity: High
- Estimated Learning Time: 4-5 hours

### Total

- **Contracts**: 5+
- **Tests**: 55+ comprehensive test cases
- **Documentation**: 5000+ lines
- **Examples**: Multiple real-world use cases

## Best Practices for Categories

### Naming

- Use descriptive names
- Follow PascalCase for contracts
- Include operation name when relevant: `FHEAdd`, `EqualityComparison`

### Documentation

- Every example should have comprehensive comments
- Include "correct" and "incorrect" patterns
- Explain the "why" not just the "what"

### Testing

- Test success cases
- Test failure/edge cases
- Test permissions thoroughly
- Include decryption verification

### Code Quality

- Follow existing style
- Use consistent formatting
- Include event logging
- Implement proper error messages

---

## Contributing to Categories

When submitting new examples:

1. Follow the structure above
2. Include comprehensive tests
3. Write clear documentation
4. Update this categories guide
5. Test on both local and Sepolia
6. Ensure no breaking changes

---

**Last Updated**: December 2025
**Zama FHEVM Examples Hub**
