// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IMiningKuni {
    function gasStart() external;
    function gasEnd() external;
    function mineKuni(address _ge, uint256 _amount) external;
    function mineKuniFrom(address sender, address _ge, uint256 _amount) external;
    function claimKuni(address _ge, uint256 _amount) external;
    function geStakedOf(address _ge, address acc) external view returns (uint256);
}
