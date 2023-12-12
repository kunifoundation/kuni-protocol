// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "./IData.sol";

interface IMetaData is IData {
    function addPower(uint256 prop, uint256[] calldata _power) external;
    function addPowerBatch(uint256[] calldata props, uint256[][] calldata data) external;
    function getPower(uint256 prop) external view returns (NFTPartProp memory);
    function getPowerTokenId(
        uint256 tokenId
    ) external view returns (NFTPartProp calldata attack, NFTPartProp calldata defend, uint256 total);

    function getPowerTeam(
        uint256[] memory tokenIds
    ) external view returns (NFTPartProp memory attack, NFTPartProp memory defend, uint256 total);
    function getPowerTeamNotTotal(
        uint256[] memory tokenIds
    ) external view returns (NFTPartProp memory attack, NFTPartProp memory defend);
    function getPowerAllTokenId(uint256 tokenId) external view returns (NFTPartProp memory power, uint256 total);
    function getPowerAllTeam(uint256[] calldata tokenIds) external view returns (NFTPartProp memory power, uint256 total);

    function addEfficiency(uint256 prop, uint256[] calldata eff) external;
    function addEfficiencyBatch(uint256[] calldata effPro, uint256[][] memory effVals) external;
    function getEfficiency(uint256 prop) external view returns (KuniEfficiency calldata efficiency);
    function getEfficiencyTokenId(uint256 tokenId) external view returns (KuniEfficiency memory efficiency);
    function getEfficiencyTokenIds(uint256[] memory tokenIds) external view returns (KuniEfficiency memory efficiency);

    function addNft(uint256 _tokenId, uint256[] memory props) external;
    function addNftBatch(uint256[] memory tokenIds, uint256[][] memory props) external;

    function addMaterials(uint256[] memory pic, uint256[][] memory data) external;
    function materialBy(uint256 pic) external view returns (uint256[] memory prop);

    function itemMetaBy(uint256 _key) external view returns (string memory, uint256);
    function addItemCraft(string[] memory names, uint256[][] memory data) external;
    function getContinentalMultiplier(uint256 contin, uint256 _type) external view returns (uint256);
}
