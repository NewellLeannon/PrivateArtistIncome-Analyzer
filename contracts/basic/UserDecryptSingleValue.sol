// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value Example
/// @notice Demonstrates user-controlled decryption of encrypted values
/// @dev Shows how only the owner of encrypted data can decrypt it
contract UserDecryptSingleValue is ZamaEthereumConfig {
    // Store encrypted values per user
    mapping(address => euint32) private _userSecrets;

    // Events
    event SecretStored(address indexed user, uint256 timestamp);

    /// @notice Submit an encrypted secret value
    /// @dev Only the submitter will be able to decrypt this value later
    /// @param encryptedSecret The encrypted value handle
    /// @param inputProof The zero-knowledge proof
    function submitSecret(externalEuint32 encryptedSecret, bytes calldata inputProof) external {
        // Convert external encrypted input
        euint32 secret = FHE.fromExternal(encryptedSecret, inputProof);

        // Store encrypted secret for this user
        _userSecrets[msg.sender] = secret;

        // ✅ CRITICAL: Grant permissions
        // FHE.allowThis - contract can use it
        FHE.allowThis(secret);
        // FHE.allow - ONLY msg.sender can decrypt it later
        FHE.allow(secret, msg.sender);

        emit SecretStored(msg.sender, block.timestamp);
    }

    /// @notice Get encrypted secret handle for the caller
    /// @dev Only returns handle; actual decryption happens off-chain by user
    /// @return bytes32 handle to the encrypted secret
    function getMySecret() external view returns (bytes32) {
        return FHE.toBytes32(_userSecrets[msg.sender]);
    }

    /// @notice Update encrypted secret
    /// @param newSecret The new encrypted value
    /// @param proof The zero-knowledge proof
    function updateSecret(externalEuint32 newSecret, bytes calldata proof) external {
        euint32 secret = FHE.fromExternal(newSecret, proof);

        _userSecrets[msg.sender] = secret;

        FHE.allowThis(secret);
        FHE.allow(secret, msg.sender);

        emit SecretStored(msg.sender, block.timestamp);
    }

    /// @notice Perform operation on user's secret (only user can trigger)
    /// @param operand The operand to add to secret
    /// @return bytes32 handle to the result
    function addToMySecret(externalEuint32 operand, bytes calldata proof) external returns (bytes32) {
        euint32 operandValue = FHE.fromExternal(operand, proof);

        // Add operand to user's secret
        euint32 result = FHE.add(_userSecrets[msg.sender], operandValue);

        // Grant permissions for user to decrypt result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return FHE.toBytes32(result);
    }

    /// @notice Check if user has stored a secret
    /// @param user The user to check
    /// @return bool indicating if user has stored data (simplified)
    function hasSecret(address user) external pure returns (bool) {
        // In real implementation, would need separate tracking
        // Encrypted data doesn't reveal existence through the handle
        return true;
    }
}
