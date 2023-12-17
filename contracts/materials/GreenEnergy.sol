// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IERC20Mint.sol";

contract GreenEnergy is ERC20("GreenEnergy", "GE"), Ownable, IERC20Burnable, IERC20Mint {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _minter;

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

    modifier onlyMinter() {
        require(_minter.contains(msg.sender), "KUNI: caller is not the minter");
        _;
    }

    function addMinter(address minter_) public onlyOwner {
        _minter.add(minter_);
    }

    function removeMinter(address minter_) public onlyOwner {
        _minter.remove(minter_);
    }

    function getMinters() external view returns (address[] memory) {
        return _minter.values();
    }
}
