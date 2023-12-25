// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMetaData.sol";

contract MetaData is Ownable, IMetaData {
    using SafeMath for uint256;

    // SLASH; HEAVY; STRIKE; TECH; MAGIC
    mapping(uint256 => NFTPartProp) private powers;
    // ore; stone; cotton; lumber
    mapping(uint256 => KuniEfficiency) public efficiencies;
    mapping(uint256 => uint256[]) public sarus;

    // SLASH; HEAVY; STRIKE; TECH; MAGIC;
    mapping(uint256 => uint256[]) public materials;
    mapping(uint256 => ItemCraft) public itemCrafts;

    mapping(uint256 => mapping(uint256 => uint256)) public continents;

    // Props
    function addPower(uint256 prop, uint256[] calldata _power) external override onlyOwner {
        _addPower(prop, _power);
    }

    function _addPower(uint256 prop, uint256[] calldata _power) internal {
        powers[prop] = NFTPartProp(_power[0], _power[1], _power[2], _power[3], _power[4], _power[5]);
    }

    function addPowerBatch(uint256[] calldata props, uint256[][] calldata _powers) external override onlyOwner {
        for (uint256 index = 0; index < props.length; index++) {
            // _slash, _heavy, _strike, _tech, _magic;
            _addPower(props[index], _powers[index]);
        }
    }

    function getPower(uint256 prop) external view override returns (NFTPartProp memory) {
        return powers[prop];
    }

    function getPowerTokenId(
        uint256 tokenId
    ) external view override returns (NFTPartProp memory attack, NFTPartProp memory defend, uint256 total) {
        (attack, defend) = _powerTokenId(tokenId, attack, defend);
        total = _totalProps(attack);
        total += _totalProps(defend);
    }

    function _powerTokenId(
        uint256 tokenId,
        NFTPartProp memory attack,
        NFTPartProp memory defend
    ) internal view returns (NFTPartProp memory, NFTPartProp memory) {
        uint256[] memory props = sarus[tokenId];
        for (uint256 j = 0; j < props.length; j++) {
            NFTPartProp memory tmp = powers[props[j]];
            if (tmp.cat == 1) {
                attack = _plusProp(attack, tmp);
            } else {
                defend = _plusProp(defend, tmp);
            }
        }
        return (attack, defend);
    }

    function getPowerTeam(
        uint256[] calldata tokenIds
    ) external view override returns (NFTPartProp memory attack, NFTPartProp memory defend, uint256 total) {
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            (attack, defend) = _powerTokenId(tokenIds[inx], attack, defend);
        }
        total = _totalProps(attack);
        total += _totalProps(defend);
    }

    function getPowerTeamNotTotal(
        uint256[] memory tokenIds
    ) external view override returns (NFTPartProp memory attack, NFTPartProp memory defend) {
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            (attack, defend) = _powerTokenId(tokenIds[inx], attack, defend);
        }
    }

    function addEfficiency(uint256 prop, uint256[] calldata eff) external override onlyOwner {
        _addEfficiency(prop, eff);
    }

    function _addEfficiency(uint256 prop, uint256[] calldata eff) internal {
        // ore; stone; cotton; lumber
        efficiencies[prop] = KuniEfficiency(eff[0], eff[1], eff[2], eff[3]);
    }

    function addEfficiencyBatch(uint256[] calldata effPro, uint256[][] calldata effVals) external override onlyOwner {
        for (uint256 index = 0; index < effPro.length; index++) {
            _addEfficiency(effPro[index], effVals[index]);
        }
    }

    function getEfficiency(uint256 prop) external view override returns (KuniEfficiency memory) {
        return efficiencies[prop];
    }

    function getEfficiencyTokenId(uint256 tokenId) external view override returns (KuniEfficiency memory efficiency) {
        efficiency = _efficiencyTokenId(tokenId, efficiency);
    }

    function getEfficiencyTokenIds(uint256[] memory tokenIds) external view override returns (KuniEfficiency memory efficiency) {
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            efficiency = _efficiencyTokenId(tokenIds[inx], efficiency);
        }
    }

    // ore, stone, wood, fiber
    function _efficiencyTokenId(uint256 tokenId, KuniEfficiency memory efficiency) internal view returns (KuniEfficiency memory) {
        uint256[] memory props = sarus[tokenId];
        for (uint256 inx = 0; inx < props.length; inx++) {
            KuniEfficiency memory tmp = efficiencies[props[inx]];
            efficiency.ore += tmp.ore;
            efficiency.stone += tmp.stone;
            efficiency.cotton += tmp.cotton;
            efficiency.lumber += tmp.lumber;
        }
        return efficiency;
    }

    function getPowerAllTokenId(uint256 tokenId) external view override returns (NFTPartProp memory power, uint256 total) {
        uint256[] memory props = sarus[tokenId];
        for (uint256 j = 0; j < props.length; j++) {
            NFTPartProp memory tmp = powers[props[j]];
            power = _plusProp(power, tmp);
        }

        total = _totalProps(power);
    }

    function getPowerAllTeam(
        uint256[] calldata tokenIds
    ) external view override returns (NFTPartProp memory power, uint256 total) {
        for (uint256 inx = 0; inx < tokenIds.length; inx++) {
            uint256[] memory props = sarus[tokenIds[inx]];
            for (uint256 j = 0; j < props.length; j++) {
                NFTPartProp memory tmp = powers[props[j]];
                power = _plusProp(power, tmp);
            }
        }
        total = _totalProps(power);
    }

    /**
    - _tokenId: tokenId[]
    - props: [[hand, weapon, head, eyes, body, hair, cat]]
   */
    function addNft(uint256 _tokenId, uint256[] memory props) external override onlyOwner {
        // KuniSaru(hand, weapon, head, eyes, body, hair);
        sarus[_tokenId] = props;
    }

    /*
    - _tokenId: tokenId
    - props: hand, weapon, head, eyes, body, hair, cat
  */
    function addNftBatch(uint256[] memory tokenIds, uint256[][] memory props) external override onlyOwner {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            sarus[tokenIds[index]] = props[index];
        }
    }

    // SLASH; HEAVY; STRIKE; TECH; MAGIC;
    function addMaterials(uint256[] memory pic, uint256[][] memory data) external override onlyOwner {
        for (uint256 index = 0; index < data.length; index++) {
            materials[pic[index]] = data[index];
        }
    }

    function materialBy(uint256 _material) external view override returns (uint256[] memory prop) {
        prop = materials[_material];
    }

    function itemMetaBy(uint256 _key) external view override returns (string memory, uint256) {
        return (itemCrafts[_key].name, itemCrafts[_key].cat);
    }

    function addItemCraft(string[] memory names, uint256[][] memory data) external override onlyOwner {
        for (uint256 index = 0; index < data.length; index++) {
            // name, cat;
            itemCrafts[data[index][0]] = ItemCraft(names[index], data[index][1]);
        }
    }

    function _plusProp(NFTPartProp memory v1, NFTPartProp memory v2) internal pure returns (NFTPartProp memory) {
        v1.slash += v2.slash;
        v1.heavy += v2.heavy;
        v1.strike += v2.strike;
        v1.tech += v2.tech;
        v1.magic += v2.magic;
        return v1;
    }

    function _totalProps(NFTPartProp memory v) internal pure returns (uint256) {
        return v.slash.add(v.heavy).add(v.strike).add(v.tech).add(v.magic);
    }

    function addContinental(uint256 contin, uint256[] calldata rates) external onlyOwner {
        _addContinentalMul(contin, rates);
    }

    function addContinentalMulBatch(uint256[] calldata contin, uint256[][] calldata multipliers) external onlyOwner {
        for (uint256 inx = 0; inx < contin.length; inx++) {
            _addContinentalMul(contin[inx], multipliers[inx]);
        }
    }

    function getContinentalMultiplier(uint256 contin, uint256 _type) external view override returns (uint256) {
        return continents[contin][_type];
    }

    function _addContinentalMul(uint256 contin, uint256[] calldata multipliers) internal {
        for (uint256 inx = 0; inx < multipliers.length; inx++) {
            continents[contin][inx + 1] = multipliers[inx];
        }
    }
}
