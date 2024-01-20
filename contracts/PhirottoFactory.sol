// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './PhirottoVault.sol';
import './helpers/AdminAccess.sol';

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PhirottoFactory is AdminAccess {

    using SafeERC20 for IERC20;

    /* ========== CONSTANTS ========== */

    /* ========== STATE VARIABLES ========== */
    mapping(string => address) public vaultAddresses;

    /* ========== CONSTRUCTOR ========== */

    constructor(
    ) AdminAccess(msg.sender) {
    }

    /* ========== USER FUNCTIONS ========== */

    function deployVault(
        string memory _vaultName,
        address whitelist,
        address _vaultAdmin,
        uint256 requestedAmount
    ) external returns (address vault) {
        vault = address(new PhirottoVault(_vaultName, requestedAmount, whitelist, _vaultAdmin));
        vaultAddresses[_vaultName] = vault;
    }

    /* ========== VIEWS ========== */

    /* ========== ADMIN FUNCTIONS ========== */

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
