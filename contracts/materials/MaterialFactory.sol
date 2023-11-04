// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IMaterialFactory.sol";
import "./Material.sol";

contract MaterialFactory is IMaterialFactory, Ownable {
  using SafeERC20 for IERC20;

  event MaterialCreated(address created, address owner, address token, string name, string symbol);
  event MaterialsCreated(address, address[]);

  function createMaterial(
    address _owner,
    address _minter,
    string memory _name,
    string memory _symbol
  ) external override returns (address) {
    Material newToken = new Material(_name, _symbol);
    newToken.setMinter(_minter);
    newToken.transferOwnership(_owner);
    emit MaterialCreated(msg.sender, _owner, address(newToken), _name, _symbol);
    return address(newToken);
  }

  function _createMaterial(
    address _owner,
    address _minter,
    string memory _name,
    string memory _symbol
  ) internal returns (address) {
    Material newToken = new Material(_name, _symbol);
    newToken.setMinter(_minter);
    newToken.transferOwnership(_owner);
    emit MaterialCreated(msg.sender, _owner, address(newToken), _name, _symbol);
    return address(newToken);
  }

  function createMaterials(address _owner) external override {
    address[] memory _materials = new address[](4);
    _materials[0] = _createMaterial(_owner, msg.sender, "Ore", "ORE");
    _materials[1] = _createMaterial(_owner, msg.sender, "Stone", "STONE");
    _materials[2] = _createMaterial(_owner, msg.sender, "Cotton", "COTTON");
    _materials[3] = _createMaterial(_owner, msg.sender, "Lumber", "LUMBER");
    emit MaterialsCreated(msg.sender, _materials);
  }
}