// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract
/// @notice This contract demonstrates basic FHEVM operations with an encrypted counter
/// @dev This is a template contract for the base-template directory
contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    /// @notice Returns the encrypted count handle
    /// @dev The returned bytes32 is a handle to the encrypted value, not the plaintext
    /// @return bytes32 handle to the encrypted count
    function getCount() external view returns (bytes32) {
        return FHE.toBytes32(_count);
    }

    /// @notice Increments the counter by a specified encrypted value
    /// @dev This example omits overflow/underflow checks for simplicity and readability
    /// @param inputEuint32 The encrypted input value handle
    /// @param inputProof The zero-knowledge proof for the encrypted input
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.add(_count, encryptedEuint32);

        // Grant permissions for both contract and user
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value
    /// @dev This example omits overflow/underflow checks for simplicity and readability
    /// @param inputEuint32 The encrypted input value handle
    /// @param inputProof The zero-knowledge proof for the encrypted input
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedEuint32);

        // Grant permissions for both contract and user
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
