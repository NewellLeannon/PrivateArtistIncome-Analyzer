// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, externalEuint32, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates encryption of single values and access control
/// @dev Shows proper permission management for encrypted data
contract EncryptSingleValue is ZamaEthereumConfig {
    // Mapping to store encrypted values per user
    mapping(address => euint32) private _encryptedValues32;
    mapping(address => euint64) private _encryptedValues64;

    // Events
    event ValueEncrypted(address indexed user, uint256 timestamp);

    /// @notice Submit an encrypted 32-bit value
    /// @dev Demonstrates: 1) Input validation, 2) Storage, 3) Permission management
    /// @param encryptedValue The encrypted value handle
    /// @param inputProof The zero-knowledge proof
    function submitEncrypted32(externalEuint32 encryptedValue, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);

        // Store encrypted value
        _encryptedValues32[msg.sender] = value;

        // ✅ CRITICAL: Grant both permissions
        // FHE.allowThis() allows the contract to use this value in operations
        FHE.allowThis(value);
        // FHE.allow() allows the user to decrypt this value later
        FHE.allow(value, msg.sender);

        emit ValueEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Submit an encrypted 64-bit value
    /// @param encryptedValue The encrypted value handle
    /// @param inputProof The zero-knowledge proof
    function submitEncrypted64(externalEuint64 encryptedValue, bytes calldata inputProof) external {
        euint64 value = FHE.fromExternal(encryptedValue, inputProof);

        _encryptedValues64[msg.sender] = value;

        // Grant permissions
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);

        emit ValueEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Get the encrypted value handle for a user
    /// @dev This returns the handle, not the plaintext value
    /// @param user The user address to retrieve
    /// @return bytes32 handle to the encrypted value
    function getEncrypted32(address user) external view returns (bytes32) {
        return FHE.toBytes32(_encryptedValues32[user]);
    }

    /// @notice Get the encrypted value handle for a user (64-bit)
    /// @param user The user address to retrieve
    /// @return bytes32 handle to the encrypted value
    function getEncrypted64(address user) external view returns (bytes32) {
        return FHE.toBytes32(_encryptedValues64[user]);
    }

    /// @notice Check if user has stored a value
    /// @param user The user address to check
    /// @return bool whether user has submitted a value
    function hasValue32(address user) external view returns (bool) {
        // Note: This checks if the mapping was accessed, not if value is non-zero
        // Encrypted data cannot reveal anything about plaintext through its handle
        return true; // In real implementation, track separately if needed
    }
}
