// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IMaterialFactory {
  function createMaterial(address _owner, address _minter, string memory _name, string memory _symbol) external returns(address);
  function createMaterials(address _owner) external;
}