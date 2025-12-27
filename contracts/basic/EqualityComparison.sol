// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Equality Comparison Example
/// @notice Demonstrates equality comparison on encrypted values using FHE.eq
/// @dev Shows how to compare encrypted values without decryption
contract EqualityComparison is ZamaEthereumConfig {
    euint32 private _value;
    ebool private _lastComparisonResult;

    /// @notice Set the stored value
    /// @dev This creates an encrypted value to test against
    /// @param encryptedValue The encrypted value handle
    /// @param proof Zero-knowledge proof
    function setValue(externalEuint32 encryptedValue, bytes calldata proof) external {
        euint32 value = FHE.fromExternal(encryptedValue, proof);
        _value = value;

        FHE.allowThis(value);
    }

    /// @notice Compare two encrypted values for equality
    /// @dev Returns encrypted boolean result
    /// @param encryptedCompare The value to compare
    /// @param proof Zero-knowledge proof
    /// @return bytes32 handle to encrypted boolean result
    function compareEqual(externalEuint32 encryptedCompare, bytes calldata proof) external returns (bytes32) {
        euint32 compare = FHE.fromExternal(encryptedCompare, proof);

        // Perform equality comparison on encrypted values
        // ✅ CORRECT: FHE.eq returns encrypted boolean (ebool)
        ebool result = FHE.eq(_value, compare);

        _lastComparisonResult = result;

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return FHE.toBytes32(result);
    }

    /// @notice Compare encrypted value against plaintext constant
    /// @param encryptedValue The encrypted value
    /// @param proof Zero-knowledge proof
    /// @param plaintextValue The plaintext value to compare
    /// @return bytes32 handle to encrypted boolean result
    function compareToPlaintext(
        externalEuint32 encryptedValue,
        bytes calldata proof,
        uint32 plaintextValue
    ) external returns (bytes32) {
        euint32 value = FHE.fromExternal(encryptedValue, proof);

        // Convert plaintext to encrypted form
        euint32 plaintextEncrypted = FHE.asEuint32(plaintextValue);

        // Compare
        ebool result = FHE.eq(value, plaintextEncrypted);

        _lastComparisonResult = result;

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return FHE.toBytes32(result);
    }

    /// @notice Get the handle to the last comparison result
    /// @return bytes32 handle to the encrypted boolean
    function getLastComparisonResult() external view returns (bytes32) {
        return FHE.toBytes32(_lastComparisonResult);
    }

    // ❌ ANTI-PATTERN: Cannot use encrypted boolean in regular if statement
    // This would NOT compile:
    // function useComparison(externalEuint32 value, bytes calldata proof) external {
    //     euint32 enc = FHE.fromExternal(value, proof);
    //     ebool result = FHE.eq(enc, FHE.asEuint32(100));
    //
    //     if (result) {  // ❌ COMPILATION ERROR: cannot use ebool in if
    //         // ...
    //     }
    // }

    // ✅ CORRECT: Use FHE.select for conditional operations on encrypted values
    /// @notice Conditional operation using encrypted boolean
    /// @param encryptedValue The encrypted value
    /// @param proof Zero-knowledge proof
    /// @param trueValue Value to return if comparison is true
    /// @param falseValue Value to return if comparison is false
    /// @return bytes32 handle to result
    function conditionalOperation(
        externalEuint32 encryptedValue,
        bytes calldata proof,
        uint32 trueValue,
        uint32 falseValue
    ) external returns (bytes32) {
        euint32 value = FHE.fromExternal(encryptedValue, proof);

        // Perform comparison
        ebool isEqual = FHE.eq(value, FHE.asEuint32(100));

        // Use FHE.select for conditional logic
        // Returns encrypted trueValue if isEqual is true, falseValue otherwise
        euint32 result = FHE.select(isEqual, FHE.asEuint32(trueValue), FHE.asEuint32(falseValue));

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return FHE.toBytes32(result);
    }
}
