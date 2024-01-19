// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import './helpers/AdminAccess.sol';

contract PhirottoVault is AdminAccess {

    constructor(
    ) AdminAccess(msg.sender) {
    }
}
