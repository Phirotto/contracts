// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../interfaces/IParticipationProver.sol";

contract FakeProver is IParticipationProver {

    function hasParticipated(address potentialParticipant, uint256 amount, bytes calldata additionalInfo) external view returns (bool) {
        return true;
    }
}
