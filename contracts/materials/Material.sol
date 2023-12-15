// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IMaterial.sol";

contract Material is ERC20, Ownable, IMaterial {
    using SafeMath for uint256;
    uint256 MAX_SUPPLY = 21000000 ether / 4;
    uint256 NUM_OF_BLOCK_PER_DAY = 28800;
    uint256 RATE = 5;
    uint256 BASE_RATE = 10000;

    address public minter;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external override onlyMinter {
        _mint(to, amount);
    }

    function getRewardForMiner(uint256 _from, uint256 _to) external view override returns (uint256) {
        return _to.sub(_from).mul(MAX_SUPPLY.sub(totalSupply()).mul(RATE).div(BASE_RATE)).div(NUM_OF_BLOCK_PER_DAY);
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "KUNI: caller is not the minter");
        _;
    }

    function setMinter(address minter_) public onlyOwner {
        minter = minter_;
    }
}
