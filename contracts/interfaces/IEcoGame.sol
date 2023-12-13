// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IEcoGame {
    // ore; stone; cotton; lumber
    function productionEfficiency(
        uint256 tokenId
    ) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber);
    function productionEfficiencyArr(uint256 tokenId) external view returns (uint256[] memory);
    function productionEfficiencyTeam(
        uint256[] calldata tokenIds
    ) external view returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber);

    function materialStas(uint256 pic, uint256 qty) external view returns (uint256[] memory);
    function materialStasBatch(uint256[] calldata _materials, uint256[] calldata qty) external view returns (uint256[] memory);
    function toCraftNameCat(uint256[] calldata items, uint8 attack) external view returns (string memory name, uint256 cat);

    function niohPower(uint256 stage) external view returns (uint256);
    function advantagePoint(
        uint256[] calldata tokenIds,
        address kuniItem,
        uint256[][] calldata items,
        uint256 stage,
        uint256 bonus
    ) external view returns (bool won, uint256 totalItem, uint256 power);
    function rewardPoint(uint256 stage, bool won, uint256 saru, uint256 item) external view returns (uint256);
    function battleBonusInc(uint256 cBonus) external view returns (uint256 value);
    function getContinentalMultiplierArr(address acc) external view returns (uint256[] memory);
    function calProductivityTeam(address sender, uint256[] calldata tokenIds, uint256 kuniAmount) external view returns (uint256[] memory);
}
