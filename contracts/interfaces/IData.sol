// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IData {
  struct ItemCraft {
    string name;
    uint256 cat;
  }

  struct NFTPartProp {
    uint256 slash;
    uint256 heavy;
    uint256 strike;
    uint256 tech;
    uint256 magic;
    uint cat;
  }
  // ore; stone; cotton; lumber
  struct KuniEfficiency {
    uint256 ore;
    uint256 stone;
    uint256 cotton;
    uint256 lumber;
  }
}