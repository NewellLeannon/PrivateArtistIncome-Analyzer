// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Add Operation Example
/// @notice Demonstrates how to perform addition on encrypted values
/// @dev This example shows the correct pattern for arithmetic operations with FHEVM
contract FHEAdd is ZamaEthereumConfig {
    euint32 private _result;

    /// @notice Get the current encrypted result
    /// @return bytes32 handle to the encrypted result
    function getResult() external view returns (bytes32) {
        return FHE.toBytes32(_result);
    }

    /// @notice Add two encrypted values together
    /// @dev Demonstrates: 1) Creating encrypted values, 2) Addition operation, 3) Permission management
    /// @param encryptedValueA The first encrypted value handle
    /// @param proofA Zero-knowledge proof for encryptedValueA
    /// @param encryptedValueB The second encrypted value handle
    /// @param proofB Zero-knowledge proof for encryptedValueB
    function addEncrypted(
        externalEuint32 encryptedValueA,
        bytes calldata proofA,
        externalEuint32 encryptedValueB,
        bytes calldata proofB
    ) external {
        // Convert external encrypted inputs to internal euint32 types
        euint32 a = FHE.fromExternal(encryptedValueA, proofA);
        euint32 b = FHE.fromExternal(encryptedValueB, proofB);

        // Perform addition on encrypted values
        // ✅ CORRECT: This works because both values are encrypted
        _result = FHE.add(a, b);

        // Grant permissions (critical for using encrypted values later)
        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);
    }

    /// @notice Add encrypted value to plaintext constant
    /// @dev Demonstrates adding a known plaintext to encrypted data
    /// @param encryptedValue The encrypted value handle
    /// @param proof Zero-knowledge proof for encryptedValue
    /// @param plaintextValue The plaintext value to add
    function addWithPlaintext(
        externalEuint32 encryptedValue,
        bytes calldata proof,
        uint32 plaintextValue
    ) external {
        euint32 encrypted = FHE.fromExternal(encryptedValue, proof);

        // Create encrypted plaintext constant
        euint32 plaintextEncrypted = FHE.asEuint32(plaintextValue);

        // Add encrypted value to plaintext
        _result = FHE.add(encrypted, plaintextEncrypted);

        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);
    }

    /// @notice Add multiple encrypted values
    /// @dev Shows accumulation of encrypted values
    /// @param values Array of encrypted value handles
    /// @param proofs Array of corresponding zero-knowledge proofs
    function addMultiple(externalEuint32[] calldata values, bytes[] calldata proofs) external {
        require(values.length == proofs.length, "Length mismatch");
        require(values.length > 0, "Empty array");

        // Initialize result to zero
        euint32 sum = FHE.asEuint32(0);

        // Sum all encrypted values
        for (uint256 i = 0; i < values.length; i++) {
            euint32 value = FHE.fromExternal(values[i], proofs[i]);
            sum = FHE.add(sum, value);
        }

        _result = sum;

        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);
    }
}
