// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "../interfaces/IAmaGame.sol";
import "../interfaces/IAmaInv.sol";
import "../interfaces/IStoreGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StoreGame is IStoreGame, Ownable {
    address public coreGame;
    address public invGame;

    function stageOf(address player) external view override returns (uint256) {
        return IAmaGame(coreGame).stageOf(player);
    }

    function battleBonusOf(address player) external view override returns (uint256) {
        return IAmaGame(coreGame).battleBonusOf(player);
    }

    function currentCapOf(address player) external view override returns (uint256) {
        return _capOf(player);
    }

    function _capOf(address player) internal view returns (uint256) {
        uint256 c = IAmaInv(invGame).currentCapOf(player);
        return c == 0 ? 20 : c;
    }

    function playInfo(address player) external view returns (uint256 cap, uint256 bonus, uint256 stage) {
        cap = _capOf(player);
        bonus = IAmaGame(coreGame).battleBonusOf(player);
        stage = IAmaGame(coreGame).stageOf(player);
    }

    function updateGame(address core, address inv) external onlyOwner {
        coreGame = core;
        invGame = inv;
    }
}
