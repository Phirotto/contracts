// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './helpers/AdminAccess.sol';
import './provers/WhitelistProver.sol';

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PhirottoVault is AdminAccess, ReentrancyGuard {

    /* ========== CONSTANTS ========== */

    string public name;
    address public GHO_TOKEN_L2 = 0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53;

    /* ========== STATE VARIABLES ========== */

    WhitelistParticipationProver public whitelist;
    mapping(address => bool) public userWithdrawn;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        string memory _vaultName,
        address _whitelist,
        address _admin
    ) AdminAccess(_admin) {
        name = _vaultName;
        whitelist = WhitelistParticipationProver(_whitelist);
    }

    /* ========== USER FUNCTIONS ========== */

    function withdrawUserStake(
    ) public nonReentrant {
        require(!userWithdrawn[msg.sender], "User already withdrawn the stake");
        uint256 ghoTransferAmount = 0; // Calculate withdrwal amount here
        userWithdrawn[msg.sender] = true;
        require(
            IERC20(GHO_TOKEN_L2).transferFrom(
                address(this), 
                msg.sender, 
                ghoTransferAmount
            ), "Transfer failed");
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
    }

    function withdrawEth(
        address payable _to, 
        uint _amount
    ) public onlyAdminOrOwner {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    }
}
