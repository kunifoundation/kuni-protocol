// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IERC20Mint {
  function mint(address account, uint256 amount) external;
}