// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Multiple Values Example
/// @notice Demonstrates handling multiple encrypted values with individual user decryption
/// @dev Shows complex operations on multiple user-controlled encrypted values
contract UserDecryptMultipleValues is ZamaEthereumConfig {
    struct UserSecrets {
        euint32 secret1;
        euint32 secret2;
        euint32 secret3;
    }

    mapping(address => UserSecrets) private _userSecrets;

    event SecretsUpdated(address indexed user, uint256 timestamp);

    /// @notice Submit three encrypted secrets
    /// @dev All three values are stored individually with user-specific permissions
    /// @param secret1 First encrypted value
    /// @param proof1 First proof
    /// @param secret2 Second encrypted value
    /// @param proof2 Second proof
    /// @param secret3 Third encrypted value
    /// @param proof3 Third proof
    function submitSecrets(
        externalEuint32 secret1,
        bytes calldata proof1,
        externalEuint32 secret2,
        bytes calldata proof2,
        externalEuint32 secret3,
        bytes calldata proof3
    ) external {
        // Convert all external inputs
        euint32 val1 = FHE.fromExternal(secret1, proof1);
        euint32 val2 = FHE.fromExternal(secret2, proof2);
        euint32 val3 = FHE.fromExternal(secret3, proof3);

        // Store encrypted values
        _userSecrets[msg.sender] = UserSecrets({secret1: val1, secret2: val2, secret3: val3});

        // Grant permissions for all three values
        FHE.allowThis(val1);
        FHE.allow(val1, msg.sender);

        FHE.allowThis(val2);
        FHE.allow(val2, msg.sender);

        FHE.allowThis(val3);
        FHE.allow(val3, msg.sender);

        emit SecretsUpdated(msg.sender, block.timestamp);
    }

    /// @notice Get all three encrypted secret handles
    /// @dev Returns three handles for off-chain decryption
    /// @return secret1 Handle to first secret
    /// @return secret2 Handle to second secret
    /// @return secret3 Handle to third secret
    function getMySecrets() external view returns (bytes32 secret1, bytes32 secret2, bytes32 secret3) {
        return (
            FHE.toBytes32(_userSecrets[msg.sender].secret1),
            FHE.toBytes32(_userSecrets[msg.sender].secret2),
            FHE.toBytes32(_userSecrets[msg.sender].secret3)
        );
    }

    /// @notice Combine user's secrets (addition)
    /// @dev Secret1 + Secret2 + Secret3
    /// @return bytes32 handle to combined result
    function combineSecrets() external view returns (bytes32) {
        UserSecrets storage secrets = _userSecrets[msg.sender];

        // Add all secrets together
        euint32 sum = FHE.add(secrets.secret1, secrets.secret2);
        sum = FHE.add(sum, secrets.secret3);

        return FHE.toBytes32(sum);
    }

    /// @notice Compare secrets (secret1 == secret2)
    /// @return bytes32 handle to encrypted boolean result
    function compareSecret1To2() external view returns (bytes32) {
        UserSecrets storage secrets = _userSecrets[msg.sender];
        return FHE.toBytes32(FHE.eq(secrets.secret1, secrets.secret2));
    }

    /// @notice Get maximum of two secrets
    /// @dev Uses conditional selection on encrypted values
    /// @return bytes32 handle to maximum value
    function getMaxSecret1And2() external view returns (bytes32) {
        UserSecrets storage secrets = _userSecrets[msg.sender];

        // Check if secret1 > secret2
        auto isGreater = FHE.gt(secrets.secret1, secrets.secret2);

        // Select the greater one
        euint32 max = FHE.select(isGreater, secrets.secret1, secrets.secret2);

        return FHE.toBytes32(max);
    }

    /// @notice Update individual secret
    /// @param index Which secret to update (0, 1, or 2)
    /// @param newValue New encrypted value
    /// @param proof Zero-knowledge proof
    function updateSecret(uint8 index, externalEuint32 newValue, bytes calldata proof) external {
        require(index < 3, "Invalid secret index");

        euint32 value = FHE.fromExternal(newValue, proof);

        if (index == 0) {
            _userSecrets[msg.sender].secret1 = value;
        } else if (index == 1) {
            _userSecrets[msg.sender].secret2 = value;
        } else {
            _userSecrets[msg.sender].secret3 = value;
        }

        FHE.allowThis(value);
        FHE.allow(value, msg.sender);

        emit SecretsUpdated(msg.sender, block.timestamp);
    }

    /// @notice Compute weighted sum of secrets
    /// @dev Weight1*Secret1 + Weight2*Secret2 + Weight3*Secret3
    /// @param w1 Weight for secret1
    /// @param w2 Weight for secret2
    /// @param w3 Weight for secret3
    /// @return bytes32 handle to weighted sum
    function weightedSum(uint32 w1, uint32 w2, uint32 w3) external view returns (bytes32) {
        UserSecrets storage secrets = _userSecrets[msg.sender];

        // Create encrypted weights
        euint32 weight1 = FHE.asEuint32(w1);
        euint32 weight2 = FHE.asEuint32(w2);
        euint32 weight3 = FHE.asEuint32(w3);

        // Compute weighted sum
        euint32 sum = FHE.mul(secrets.secret1, weight1);
        sum = FHE.add(sum, FHE.mul(secrets.secret2, weight2));
        sum = FHE.add(sum, FHE.mul(secrets.secret3, weight3));

        return FHE.toBytes32(sum);
    }
}
