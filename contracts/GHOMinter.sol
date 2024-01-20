// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IOptimismL1StandardBridge.sol';
import './helpers/AdminAccess.sol';

// Currently non-functional since minting through AAVE deprioritized
contract GHOMinter is AdminAccess {

    using SafeERC20 for IERC20;

    address public GHO_TOKEN = 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60;
    address public GHO_TOKEN_L2 = 0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53;
    address public BRIDGE_ADDRESS = 0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1;
    uint32 public _minGasLimit = 200_000;

    mapping(address => bool) public depositTokens;

    constructor(
    ) AdminAccess(msg.sender) {
        IERC20(GHO_TOKEN).approve(BRIDGE_ADDRESS, type(uint256).max);
    }

    function depositAsset(
        uint256 _amount
    ) external {
    }

    function receiveFunds(
        address _token,
        uint256 _amount,
        address _to
    ) public {
        require(_amount > 0, "Nothing to receive");
        require(_to != address(0));
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function addDepositToken(
        address _newToken
    ) external onlyAdminOrOwner {
        depositTokens[_newToken] = true;
    }

    function setGHO(
        address _newToken
    ) external onlyAdminOrOwner {
        GHO_TOKEN = _newToken;
    }

    function setGHOL2(
        address _newToken
    ) external onlyAdminOrOwner {
        GHO_TOKEN_L2 = _newToken;
    }

    function setBridgeAddress(
        address _newAddress
    ) external onlyAdminOrOwner {
        BRIDGE_ADDRESS = _newAddress;
    }

    function setMinGasLimit(
        uint32 _newLimit
    ) external onlyAdminOrOwner {
        _minGasLimit = _newLimit;
    }
}
