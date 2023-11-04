// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IERC20Mint.sol";

contract GreenEnergy is ERC20("GreenEnergy", "GE"), Ownable, IERC20Burnable, IERC20Mint {
  mapping(address => uint256) private _burnOf;
  uint256 private _burnSupply;
  address private _minter;

  function mint(address to, uint256 amount) external override onlyMinter {
    _mint(to, amount);
  }

  function burn(uint256 amount) external override virtual {
    _burn(msg.sender, amount);
  }

  function _burn(address account, uint256 amount) internal override {
    _burnOf[account] += amount;
    _burnSupply += amount;
    super._burn(account, amount);
  }

  function burnFrom(address account, uint256 amount) external override virtual {
    _spendAllowance(account, msg.sender, amount);
    _burn(account, amount);
  }

  function burnSupply() external override view returns(uint256) {
    return _burnSupply;
  }
  function burnOf(address acc) external override view returns(uint256) {
    return _burnOf[acc];
  }

  function circulatingSupply() external override view returns (uint256) {
    return totalSupply();
  }

  modifier onlyMinter() {
    require(msg.sender == _minter, "AmaMinter: caller is not the minter");
    _;
  }

  function setMinter(address minter_) public onlyOwner {
    if (_minter == address(0x0)) {
      _minter = minter_;
    }
  }
}
