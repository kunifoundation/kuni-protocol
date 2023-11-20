// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IMaterial.sol";
import "../commons/AmaMinter.sol";

contract Material is ERC20, Ownable, IMaterial {
  using SafeMath for uint256;
  uint256 MAX_SUPPLY = 105000000 ether;
  uint256 NUM_OF_BLOCK_PER_DAY = 28800;
  uint256 MAGIC_NUM = 1e12;
  uint256 RATE = 25;

  address public minter;

  mapping(address => uint256) private _burnOf;
  uint256 private _burnSupply;

  constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
  }

  function mint(address to, uint256 amount) external override onlyMinter {
    _mint(to, amount);
  }

  function burn(uint256 amount) external override virtual {
    _burn(msg.sender, amount);
  }

  function burnFrom(address account, uint256 amount) external override virtual {
    _spendAllowance(account, msg.sender, amount);
    _burn(account, amount);
  }

  function getRewardForMiner(uint256 _from, uint256 _to) external override view returns(uint256) {
    if (_from >= _to) return 0; 
    return _to.sub(_from).mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(1000000)).div(NUM_OF_BLOCK_PER_DAY);
  }

  function _burn(address account, uint256 amount) internal override {
    _burnOf[account] += amount;
    _burnSupply += amount;
    super._burn(account, amount);
  }

  function burnSupply() external override view returns(uint256) {
    return _burnSupply;
  }
  function burnOf(address acc) external override view returns(uint256) {
    return _burnOf[acc];
  }

  function circulatingSupply() external override view returns(uint256) {
    if (MAX_SUPPLY > (totalSupply() + _burnSupply)) {
      return MAX_SUPPLY - totalSupply() - _burnSupply;
    }
    return 0;
  }

  modifier onlyMinter() {
    require(msg.sender == minter, "Amakuni: caller is not the minter");
    _;
  }

  function setMinter(address minter_) public onlyOwner {
    if (minter == address(0x0)) {
      minter = minter_;
    }
  }
}