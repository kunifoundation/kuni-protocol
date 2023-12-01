// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "./IERC20Mint.sol";
import "./IERC20Burnable.sol";

interface IMaterial is IERC20Mint, IERC20Burnable {
    function getRewardForMiner(uint256 _from, uint256 _to) external view returns (uint256);
}
