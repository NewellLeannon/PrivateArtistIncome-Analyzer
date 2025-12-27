# FHEVM Examples Overview

Complete overview of all example contracts available in this repository.

## Available Examples

### 1. Private Artist Income Analyzer ⭐

**Type**: Full Application (Privacy Category)
**Files**:
- Contract: `contracts/PrivateArtistIncomeAnalyzer.sol`
- Tests: `test/PrivateArtistIncomeAnalyzer.ts` (30+ tests)

**Description**:
A privacy-preserving smart contract platform for confidential artist income analytics using FHEVM.

**Features**:
- Artist registration with anonymous identifiers
- Encrypted income data submission
- Creative analytics tracking across multiple categories
- Confidential aggregation of encrypted data
- Access control for authorized analysts
- Report generation with aggregate statistics
- User profile management and privacy guarantees

**Key Concepts Demonstrated**:
- Encrypted struct storage (ArtistProfile, IncomeReport)
- Mapping with encrypted values
- Role-based access control (owner, analysts)
- Permission management (FHE.allowThis, FHE.allow)
- Encrypted aggregation without decryption
- Event emission for transparency
- Async decryption of results

**Real-World Applications**:
- Creative economy analytics
- Income benchmarking platforms
- Market research with privacy
- Survey systems with confidentiality

**Learning Difficulty**: Medium to High
**Estimated Time**: 4-5 hours
**Prerequisites**: Understanding of basic FHEVM concepts

---

### 2. FHE Add ✅

**Type**: Basic Arithmetic (Basic Category)
**Files**:
- Contract: `contracts/basic/FHEAdd.sol`
- Tests: `test/basic/FHEAdd.ts`

**Description**:
Demonstrates addition operations on encrypted values.

**Features**:
- Add two encrypted values
- Add encrypted value to plaintext constant
- Accumulate multiple encrypted values
- Permission management for arithmetic operations

**Key Concepts**:
- FHE.add operation
- Multiple encrypted inputs
- Plaintext-encrypted arithmetic
- Result storage and permissions

**Use Cases**:
- Accumulating encrypted balances
- Sum calculations in privacy-preserving contexts
- Batch processing of encrypted transactions

**Difficulty**: Easy
**Time**: 30 minutes

---

### 3. Encrypt Single Value ✅

**Type**: Encryption Input (Encryption Category)
**Files**:
- Contract: `contracts/basic/EncryptSingleValue.sol`
- Tests: `test/basic/EncryptSingleValue.ts`

**Description**:
Shows how to receive, store, and manage encrypted values with proper permissions.

**Features**:
- Accept encrypted 32-bit values (euint32)
- Accept encrypted 64-bit values (euint64)
- Store encrypted values per user
- Retrieve encrypted value handles
- Proper permission management
- Event logging

**Key Concepts**:
- FHE.fromExternal for input conversion
- Input proof validation
- FHE.allowThis for contract permissions
- FHE.allow for user permissions
- Encrypted state storage
- Handle vs plaintext value distinction

**Use Cases**:
- Private vault systems
- Confidential account creation
- User data storage with privacy
- Encrypted transaction inputs

**Difficulty**: Easy
**Time**: 45 minutes

---

### 4. Equality Comparison ✅

**Type**: Encrypted Comparisons (Basic Category)
**Files**:
- Contract: `contracts/basic/EqualityComparison.sol`
- Tests: `test/basic/EqualityComparison.ts`

**Description**:
Demonstrates comparing encrypted values without decryption.

**Features**:
- Compare two encrypted values for equality
- Compare encrypted value against plaintext constant
- Encrypted boolean results (ebool)
- Conditional operations using FHE.select
- Anti-patterns explained (❌ don't use ebool in if)

**Key Concepts**:
- FHE.eq operation
- Encrypted boolean (ebool) types
- FHE.select for conditional logic
- Comparison results handling
- Anti-pattern: Direct if statement usage

**Use Cases**:
- Encrypted password verification
- Confidential threshold checks
- Privacy-preserving voting systems
- Encrypted decision logic

**Difficulty**: Medium
**Time**: 1 hour

---

### 5. FHECounter (Base Template)

**Type**: Simple Counter (Basic Category)
**Location**: `base-template/contracts/FHECounter.sol`
**Tests**: `base-template/test/FHECounter.ts`

**Description**:
Template contract showing a simple encrypted counter.

**Features**:
- Increment by encrypted value
- Decrement by encrypted value
- Initialize to zero
- Basic FHE operations

**Key Concepts**:
- FHE.add and FHE.sub
- External input handling
- Permission management
- State variable management

---

## Example Statistics

| Example | Category | Difficulty | Time | Tests | LOC |
|---------|----------|-----------|------|-------|-----|
| Private Artist Income Analyzer | Privacy | High | 4-5h | 30+ | 320 |
| FHE Add | Basic | Easy | 30m | 4 | 80 |
| Encrypt Single Value | Encryption | Easy | 45m | 5 | 90 |
| Equality Comparison | Basic | Medium | 1h | 4 | 100 |
| FHECounter | Basic | Easy | 30m | 3 | 50 |

**Total**: 5 core examples with 46+ comprehensive test cases

---

## Recommended Learning Path

### Complete Beginner (5-7 hours)

1. **Read**: [FHE Overview](docs/fhe-overview.md)
2. **Study**: `FHECounter` - Basic increment/decrement
3. **Study**: `EncryptSingleValue` - Input handling
4. **Study**: `FHEAdd` - Multi-value arithmetic
5. **Study**: `EqualityComparison` - Comparisons
6. **Practice**: Modify these contracts

### Intermediate Developer (8-10 hours)

7. **Read**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
8. **Study**: `PrivateArtistIncomeAnalyzer` structure
9. **Implement**: Permission patterns
10. **Deploy**: To testnet
11. **Test**: Edge cases and failures

### Advanced Implementation (15+ hours)

12. **Design**: Your own FHEVM contract
13. **Implement**: Full application
14. **Deploy**: To Sepolia
15. **Optimize**: Gas usage
16. **Audit**: Security review
17. **Document**: Complete guides

---

## Running Examples Locally

### Setup

```bash
npm install
npm run compile
```

### Run All Tests

```bash
npm run test
```

### Run Specific Example Tests

```bash
# Test FHE Add
npx hardhat test --grep "FHEAdd"

# Test PrivateArtistIncomeAnalyzer
npx hardhat test test/PrivateArtistIncomeAnalyzer.ts

# Test with coverage
npm run coverage
```

### Deploy Examples

```bash
# Local deployment
npm run deploy:localhost

# Sepolia testnet
npm run deploy:sepolia
```

---

## Example Comparison Matrix

| Feature | FHECounter | FHEAdd | Encrypt | Compare | Artist |
|---------|-----------|--------|---------|---------|--------|
| Input Encryption | ✅ | ✅ | ✅ | ✅ | ✅ |
| Arithmetic | ✅ | ✅ | ❌ | ❌ | ✅ |
| Comparisons | ❌ | ❌ | ❌ | ✅ | ✅ |
| Multiple Users | ❌ | ❌ | ✅ | ❌ | ✅ |
| Access Control | ❌ | ❌ | ❌ | ❌ | ✅ |
| Aggregation | ❌ | ✅ | ❌ | ❌ | ✅ |
| Real-World Use | ❌ | ⚠️ | ✅ | ✅ | ✅ |

---

## Next Steps

### For Learning
1. Study each example in detail
2. Modify and test changes
3. Combine concepts into new contracts
4. Review anti-patterns documentation

### For Development
1. Use base-template as starting point
2. Generate standalone examples with automation tools
3. Create category-based projects
4. Deploy to testnet

### For Production
1. Complete security audit
2. Optimize gas usage
3. Implement emergency procedures
4. Deploy with monitoring

---

## Resources

### Official Documentation
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org
- **TypeScript Guide**: https://www.typescriptlang.org/docs/

### Code Examples
- **Base Template**: `base-template/` directory
- **Full Application**: `PrivateArtistIncomeAnalyzer.sol`
- **Basic Examples**: `contracts/basic/` directory

### Community
- **Zama Discord**: https://discord.com/invite/zama
- **Zama Forum**: https://www.zama.ai/community
- **GitHub Issues**: Report bugs and request features

---

## Contributing Examples

Have a great FHEVM example? We'd love to see it!

1. **Create**: Develop your contract and tests
2. **Document**: Add comprehensive comments
3. **Test**: Ensure 100% test coverage
4. **Submit**: Open a pull request
5. **Review**: Engage with feedback
6. **Merge**: Join the examples hub

### Guidelines

- Follow existing code style
- Include detailed comments
- Add comprehensive tests
- Document use cases
- Explain design decisions
- Include security considerations

---

## Example Evolution

### Current (v1.0)

✅ Basic arithmetic operations
✅ Input encryption
✅ Comparisons
✅ Complete application

### Planned

🔄 Public key encryption examples
🔄 Advanced conditional logic
🔄 Batch operations optimization
🔄 Gas optimization patterns
🔄 Integration examples (oracles, bridges)

### Future

💡 DeFi protocols on encrypted data
💡 Governance with privacy
💡 Confidential NFTs
💡 Privacy-preserving exchanges

---

**Happy Learning!** 🔐

For questions, reach out to the Zama community or check the [documentation](docs/).

Last Updated: December 2025
