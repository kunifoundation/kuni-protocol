// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IMaterial.sol";

contract Material is ERC20, Ownable, IMaterial {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _minter;

    uint256 MAX_SUPPLY = 21000000 ether / 4;
    uint256 NUM_OF_BLOCK_PER_DAY = 28800;
    uint256 RATE = 5;
    uint256 BASE_RATE = 10000;
    uint256 BLOCK_LIMIT = 90 * 24 * 60 * 60 / 3;

    address public minter;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external override onlyMinter {
        _mint(to, amount);
    }

    function getRewardForMiner(address addr, uint256 _from, uint256 _to) external view override returns (uint256) {
        if (!_minter.contains(addr)) return 0;

        uint256 duration =  _to.sub(_from);
        if (duration > BLOCK_LIMIT) {
            duration = BLOCK_LIMIT;
        }
        return duration.mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(BASE_RATE)).div(NUM_OF_BLOCK_PER_DAY);
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
