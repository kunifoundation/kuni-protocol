// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IAmaInv {
    event Craft(address indexed, uint256);
    function craft(address[] calldata tokens, uint256[] calldata amounts, uint8 cType) external;
    function currentCapOf(address acc) external view returns (uint256);
}
