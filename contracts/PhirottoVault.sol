// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './helpers/AdminAccess.sol';
import './interfaces/IParticipationProver.sol';

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PhirottoVault is AdminAccess, ReentrancyGuard {

    /* ========== CONSTANTS ========== */

    string public name;
    address public GHO_TOKEN_L2 = 0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53;


    /* ========== STRUCTS ========== */

    struct UserState {
        bool registered;
        uint256 amount;
        uint256 withdrawn;
    }

    /* ========== STATE VARIABLES ========== */

    uint256 public requestedAmount;
    uint256 totalGhoWithdrawned;
    IParticipationProver public whitelist;
    mapping(address => UserState) public participants;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        string memory _vaultName,
        uint256 _requestedAmount,
        address _whitelist,
        address _admin
    ) AdminAccess(_admin) {
        name = _vaultName;
        requestedAmount = _requestedAmount;
        require(_whitelist != address(0));
        whitelist = IParticipationProver(_whitelist);
    }

    /* ========== USER FUNCTIONS ========== */

    function checkIn(
        address account,
        uint256 amount,
        bytes calldata proof
    ) public nonReentrant {
        require(!participants[account].registered, "Account already registered");
        require(whitelist.hasParticipated(account, amount, proof), "Non whitelisted user");
        participants[account] = UserState({
            registered: true,
            amount: amount,
            withdrawn: 0
        });
    }

    function withdrawUserStake(
    ) public nonReentrant {
        UserState storage participant = participants[_msgSender()];
        require(participant.registered, "Non registered participant");
        uint256 ghoBalance = IERC20(GHO_TOKEN_L2).balanceOf(address(this)) + totalGhoWithdrawned;
        uint256 ghoTransferAmount = calculateWithdrawAmount(participant, ghoBalance);
        if (ghoTransferAmount > 0) {
            totalGhoWithdrawned += ghoTransferAmount;
            participants[_msgSender()].withdrawn += ghoTransferAmount;
            require(
                IERC20(GHO_TOKEN_L2).transfer(
                    _msgSender(), 
                    ghoTransferAmount
                ), "Transfer failed");
        }
    }

    function fillPercent() public view returns (uint256) {
        uint256 ghoBalance = IERC20(GHO_TOKEN_L2).balanceOf(address(this)) + totalGhoWithdrawned;
        return (ghoBalance * 100 / requestedAmount);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function calculateWithdrawAmount(UserState storage user, uint256 ghoBalance) internal view returns (uint256) {
        uint256 vaultFillPercent = (ghoBalance * 100 / requestedAmount);
        uint256 userStake = (user.amount * vaultFillPercent) / 100;
        return userStake - user.withdrawn;
    }


    /* ========== ADMIN FUNCTIONS ========== */

    function setGHO(
        address _newToken
    ) external onlyAdminOrOwner {
        GHO_TOKEN_L2 = _newToken;
    }

    function withdrawToken(
        IERC20 _tokenToWithdraw, 
        address _to, 
        uint _amount
    ) external onlyAdminOrOwner {
        require(_tokenToWithdraw.transfer(_to, _amount));
        if (address(_tokenToWithdraw) == GHO_TOKEN_L2) {
            totalGhoWithdrawned += _amount;
        }
    }

    function withdrawEth(
        address payable _to, 
        uint _amount
    ) public onlyAdminOrOwner {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    }
}
