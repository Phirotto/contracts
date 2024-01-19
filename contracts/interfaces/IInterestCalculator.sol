// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IInterestCalculator {
    function getInterest(uint256 campaignId, uint campaignStartTimestamp, uint targetTimestamp, uint256 percentPayed) external view returns (uint256 interest);
}