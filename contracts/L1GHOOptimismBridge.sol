// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IOptimismL1StandardBridge.sol';
import './helpers/AdminAccess.sol';

abstract contract L1GHOOptimismBridge is AdminAccess {

    using SafeERC20 for IERC20;

    address public GHO_TOKEN = 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60;
    address public GHO_TOKEN_L2 = 0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53;
    address public BRIDGE_ADDRESS = 0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1;
    uint32 public _minGasLimit = 200_000;

    constructor(
    ) AdminAccess(msg.sender) {
        IERC20(GHO_TOKEN).approve(BRIDGE_ADDRESS, type(uint256).max);
    }

    function bridgeGHO(
        uint256 _amount
    ) external {
        bridgeGHOTo(_amount, msg.sender);
    }

    function bridgeGHOTo(
        uint256 _amount,
        address _to
    ) public {
        require(_amount > 0, "Nothing to bridge");
        require(_to != address(0));
        require(IERC20(GHO_TOKEN).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        IOptimismL1StandardBridge(BRIDGE_ADDRESS).depositERC20To(
            GHO_TOKEN,
            GHO_TOKEN_L2,
            _to,
            _amount,
            _minGasLimit,
            "0x"
        );
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

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

contract OptimismGHOBridge is L1GHOOptimismBridge {
}
