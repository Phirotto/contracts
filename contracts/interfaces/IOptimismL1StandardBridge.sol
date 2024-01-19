// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IOptimismL1StandardBridge {
    function depositERC20To(
        address _l1Token,
        address _l2Token,
        address _to,
        uint256 _amount,
        uint32 _minGasLimit,
        bytes calldata _extraData
    ) external;
}
