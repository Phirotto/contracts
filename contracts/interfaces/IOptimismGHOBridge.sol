// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IOptimismGHOBridge {

    // function GHO_TOKEN(
    // ) external view returns (address);

    function bridgeGHO(
        uint256 _amount
    ) external;

    function bridgeGHOTo(
        uint256 _amount,
        address _to
    ) external;
}
