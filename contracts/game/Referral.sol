// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IReferral.sol";

contract Referral is IReferral, Ownable {
    using SafeMath for uint256;

    mapping(address => Ref) public _ref;
    mapping(string => Ref) public refOwner;
    mapping(address => string[]) public userOfCodes;
    mapping(string => address[]) public codeOfUsers;
    mapping(address => string) public userRefCode;
    uint256 public EXTRA = 5000;
    uint256 public constant PERCENT = 10000;
    string public ROOT_CODE;
    string public CODE_PREFIX = "AMAKUNI_";
    uint256 public RATE_PREFIX = 5000;

    function refPoint(address sender, uint256 point) external view override returns (uint256, uint256, address) {
        address refer = _ref[sender].ref;
        if (refer == address(0x0)) {
            return (point, 0, _ref[sender].ref);
        }

        uint256 extraReward = point.mul(EXTRA).div(PERCENT);
        uint256 refReward = extraReward.mul(_ref[sender].rate).div(PERCENT);
        return (point.add(extraReward.sub(refReward)), refReward, _ref[sender].ref);
    }

    function applyCode(string calldata code) external {
        _applyCode(code);
        emit CodeApplied(msg.sender, code, refOwner[code].ref, refOwner[code].rate);
    }

    function applyCreateCode(string calldata code, string calldata _myCode) external {
        _applyCode(code);
        _createCode(msg.sender, _myCode, RATE_PREFIX);
        emit CodeAppliedCreated(msg.sender, code, _myCode, RATE_PREFIX);
    }

    function _applyCode(string calldata code) internal {
        require(refOwner[code].ref != address(0), "KUNI: REF_NOT_EXISTS");
        require(refOwner[code].ref != msg.sender, "KUNI: SELF_REF");
        require(_ref[msg.sender].ref == address(0), "KUNI: NOT_ALLOWED");
        _ref[msg.sender].ref = refOwner[code].ref;
        _ref[msg.sender].rate = refOwner[code].rate;
        userRefCode[msg.sender] = code;
        codeOfUsers[code].push(msg.sender);
    }

    function createCode(string calldata code, uint256 rate) external {
        require(
            keccak256(abi.encodePacked(userRefCode[msg.sender])) != keccak256(abi.encodePacked("")),
            "KUNI: Apply a code first!"
        );
        _createCode(msg.sender, code, rate);
        emit CodeCreated(msg.sender, code, rate);
    }

    function createCodeTo(address to, string calldata code, uint256 rate) external onlyOwner {
        _createCode(to, code, rate);
        ROOT_CODE = code;
        emit CodeCreated(to, code, rate);
    }

    function _createCode(address to, string memory code, uint256 rate) internal {
        require(rate <= PERCENT, "KUNI: MAX_RATE");
        require(keccak256(abi.encodePacked(code)) != keccak256(abi.encodePacked("")), "KUNI: CODE_EMPTY");
        require(refOwner[code].ref == address(0), "KUNI: ALREADY_EXISTS");
        refOwner[code].ref = to;
        refOwner[code].rate = rate;
        userOfCodes[to].push(code);
    }

    function setExtra(uint256 extral) external onlyOwner {
        require(extral <= PERCENT, "KUNI: EXTRA_LARGE");
        EXTRA = extral;
    }

    function balanceCodeOf(string calldata code) external view returns (uint256) {
        return codeOfUsers[code].length;
    }

    function balanceUserOf(address addr) external view returns (uint256) {
        return userOfCodes[addr].length;
    }

    function codesOf(address addr) external view returns (string[] memory) {
        return userOfCodes[addr];
    }

    function codeRefOf(string calldata code) external view returns (address[] memory) {
        return codeOfUsers[code];
    }
}
