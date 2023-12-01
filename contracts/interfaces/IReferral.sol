// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IReferral {
    struct Ref {
        address ref;
        uint256 rate;
    }

    event CodeCreated(address indexed referrer, string indexed code, uint256 rate);
    event CodeApplied(address indexed user, string indexed code, address indexed referrer, uint256 rate);
    event CodeAppliedCreated(address indexed user, string indexed code, string myCode, uint256 rate);

    function refPoint(address, uint256) external view returns (uint256, uint256, address);
}
