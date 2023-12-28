// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "./IERC20Mint.sol";

interface IMaterial is IERC20Mint {
    function getRewardForMiner(address addr, uint256 _from, uint256 _to) external view returns (uint256);
}
