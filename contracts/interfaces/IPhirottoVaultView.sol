// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./IInterestCalculator.sol";
import "./IParticipationProver.sol";

struct PhirottoVaultInfo {
    uint256 id;
    bool interestEnabled;
    uint256 debtPercentPayed; // in 1e-2%
    uint256 interestPercentPayed; // in 1e-2%
    uint256 accruedInterest; 
    bytes32 mainfestIpfsHash;
}

interface IPhirottoVaultView {
    function getVaultInfo(uint256 campaignId) external view returns(PhirottoVaultInfo memory);
}

struct UserStakeView {
    uint256 id;
    bool isParticipant;
    uint256 participationAmount;
    uint256 debt;
}

interface IUserStakeView {
    function getUserDebt(address user, uint256 campaignId) external view returns (UserStakeView memory);
    function getWithdrawableAmount(address user, uint256 campaignId) external view returns (uint256);
}

// User's debt position calculated by formula: b * (i * f) + f
// where b - total users amount,
// i - calculated interest.getInterest() or 1 if interest = address(0)
// f - fixed price
struct PhirottoVaultDepositorInfo {
    uint256 id;
    IInterestCalculator interest; // Optional
    uint256 fixedPrice;
    uint256 totalUsersAmount;
}

interface IPhirottoVaultDepositorView {
    function getVaultPaymentInfo(uint256 campaignId) external view returns (PhirottoVaultDepositorInfo memory);
}