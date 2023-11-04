// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/access/Ownable.sol";

contract AmaMinter is Ownable {
  address private _minter;
  constructor() {
    _minter = msg.sender;
  }

  modifier onlyMinter() {
    require(msg.sender == _minter, "AmaMinter: caller is not the minter");
    _;
  }

  function setMinter(address minter_) public onlyOwner {
    _minter = minter_;
  }
}