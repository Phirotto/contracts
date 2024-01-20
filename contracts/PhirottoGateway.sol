// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './interfaces/IOptimismGHOBridge.sol';
import './helpers/AdminAccess.sol';
import './PhirottoVault.sol';

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PhirottoGateway is AdminAccess {

    /* ========== HELPER STRUCTURES ========== */

    enum Currency {
        USDC,
        DAI,
        USDT
    }

    using SafeERC20 for IERC20;

    /* ========== CONSTANTS ========== */

    /* ========== STATE VARIABLES ========== */

    address public GHO_BRIDGE;
    address public TREASURY;
    address public GHO_TOKEN = 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60;
    mapping(string => address) public vaultAddressesL2;
    mapping(address => bool) public stableDepositTokens;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _treasury,
        address _ghoBridge
    ) AdminAccess(msg.sender) {
        TREASURY = _treasury;
        GHO_BRIDGE = _ghoBridge;
        IERC20(GHO_TOKEN).approve(GHO_BRIDGE, type(uint256).max);
    }

    /* ========== USER FUNCTIONS ========== */

    function deposit(
        string memory _vaultName,
        address _depositToken,
        uint256 _dollarAmount
    ) public {
        address vaultAddress = vaultAddressesL2[_vaultName];
        require(vaultAddress != address(0), "Vault doesn't exist");
        require(stableDepositTokens[_depositToken], "Can't use this deposit token");
        require(
            IERC20(_depositToken).transferFrom(
                msg.sender, 
                TREASURY, 
                _dollarAmount * (10 ** IERC20Metadata(_depositToken).decimals())
            ), "Transfer failed");
        uint256 ghoTransferAmount = _dollarAmount * (10 ** 18); // Hard-coded since GHO is 18 decimals
        require(
            IERC20(GHO_TOKEN).transferFrom(
                TREASURY, 
                address(this), 
                ghoTransferAmount
            ), "Transfer failed");
        IOptimismGHOBridge(GHO_BRIDGE).bridgeGHOTo(ghoTransferAmount, vaultAddress);
    }

    /* ========== VIEWS ========== */

    /* ========== ADMIN FUNCTIONS ========== */

    function setBridgeAddress(
        address _newAddress
    ) external onlyAdminOrOwner {
        GHO_BRIDGE = _newAddress;
    }

    function setTreasuryAddress(
        address _newAddress
    ) external onlyAdminOrOwner {
        TREASURY = _newAddress;
    }

    function addL2Vault(
        string memory _vaultName,
        address _vaultAddress
    ) external onlyAdminOrOwner {
        vaultAddressesL2[_vaultName] = _vaultAddress;
    }

    function removeL2Vault(
        string memory _vaultName
    ) external onlyAdminOrOwner {
        vaultAddressesL2[_vaultName] = address(0);
    }

    function addDepositToken(
        address _tokenAddress
    ) external onlyAdminOrOwner {
        stableDepositTokens[_tokenAddress] = true;
    }

    function removeDepositToken(
        address _tokenAddress
    ) external onlyAdminOrOwner {
        stableDepositTokens[_tokenAddress] = false;
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
