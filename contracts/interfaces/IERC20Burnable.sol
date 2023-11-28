// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IERC20Burnable {
  function burn(uint256 amount) external;
  function burnFrom(address account, uint256 amount) external;
  function burnSupply() external view returns(uint256);
  function circulatingSupply() external view returns (uint256 _supply);
}