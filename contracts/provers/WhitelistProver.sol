// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "../interfaces/IParticipationProver.sol";

contract WhitelistParticipationProver is IParticipationProver {

    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function hasParticipated(address potentialParticipant, uint256 amount, bytes calldata additionalInfo) external view returns (bool) {
        bytes32[] memory proof = abi.decode(additionalInfo, (bytes32[]));
        return isMerkleWhitelisted(potentialParticipant, amount, proof);
    }

    function isMerkleWhitelisted(address potentialParticipant, uint256 amount, bytes32[] memory proof) internal view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(potentialParticipant, amount))));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

}