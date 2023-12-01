// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IERC20Mint.sol";

contract GreenEnergy is ERC20("GreenEnergy", "GE"), Ownable, IERC20Burnable, IERC20Mint {
    address private _minter;

    function mint(address to, uint256 amount) external override onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) external virtual override {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external virtual override {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    function circulatingSupply() external view override returns (uint256) {
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
