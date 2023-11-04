// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IStoreGame {
  function stageOf(address player) external view returns(uint256);
  function battleBonusOf(address player) external view returns(uint256);
  function currentCapOf(address player) external view returns(uint256);
}

 