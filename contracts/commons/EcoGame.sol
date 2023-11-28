// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IData.sol";
import "../interfaces/IMetaData.sol";
import "../interfaces/IEcoGame.sol";
import "../interfaces/IERC721Mint.sol";
import "../interfaces/IERC20Burnable.sol";


contract EcoGame is IEcoGame, Ownable, IData {
  using SafeMath for uint256;

  IMetaData private meta;
  uint256 public constant _DECIMALS = 1e18;
  uint256 public constant KUNI_TOTAL = 1e4;
  // Battle Point
  uint256 public kBonus = 1e3; // => 0,001  mul 1e6
  uint256 public maxBonus = 2e6;  // 1e6
  
  constructor(address _kuniMeta) {
    meta = IMetaData(_kuniMeta);
  }

  // ore; stone; cotton; lumber;
  function productionEfficiency(uint256 tokenId) view override external returns(uint256 ore, uint256 stone, uint256 cotton, uint256 lumber) {
    KuniEfficiency memory eff = meta.getEfficiencyTokenId(tokenId);
    return (eff.ore, eff.stone, eff.cotton, eff.lumber);
  }

  function productionEfficiencyArr(uint256 tokenId) view override external returns(uint256[] memory) {
    KuniEfficiency memory eff = meta.getEfficiencyTokenId(tokenId);
    uint256[] memory stats = new uint256[](4);
    stats[0] = eff.ore;
    stats[1] = eff.stone;
    stats[2] = eff.cotton;
    stats[3] = eff.lumber;
    return stats;
  }

  function productionEfficiencyTeam(uint256[] calldata tokenIds) view override external returns (uint256 ore, uint256 stone, uint256 cotton, uint256 lumber) {
    KuniEfficiency memory eff = meta.getEfficiencyTokenIds(tokenIds);
    return (eff.ore, eff.stone, eff.cotton, eff.lumber);
  }

  function niohPower(uint256 stage) external override pure returns(uint256) {
    return _niohPower(stage);
  }

  function _niohPower(uint256 stage) internal pure returns(uint256) {
    require(stage > 0, 'Stage less zero.');
    return (stage ** 2).mul(1 ether);
  }

  function advantagePoint(uint256[] calldata tokenIds, address kuniItem, uint256[][] calldata items, uint256 stage, uint256 bonus, uint256 power) external override view returns(bool won, uint256 totalItem) {
    
    (NFTPartProp memory niohAttack, NFTPartProp memory niohDefend, NFTPartProp memory kuniAttack, NFTPartProp memory kuniDefend, uint256 _totalItem) = _calPower(tokenIds, kuniItem, items, stage, bonus, power);
    totalItem = _totalItem;
    uint256 apKuni = _advantagePoint(kuniAttack, niohDefend);
    uint256 apNioh = _advantagePoint(niohAttack, kuniDefend);
    apKuni = apKuni.div(_DECIMALS);
    apNioh = apNioh.div(_DECIMALS);
    uint256 kuniWin = apKuni.mul(10000).div(apKuni.add(apNioh));
    uint256 niohWin = apNioh.mul(10000).div(apKuni.add(apNioh));
    won = apKuni > apNioh;
    uint256 rate = won ? kuniWin.sub(niohWin) : niohWin.sub((kuniWin));
    if (rate < 500) {
      won = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number, block.coinbase))).mod(10) > 500;
    }
  }

  function _calPower(uint256[] calldata tokenIds, address kuniItem, uint256[][] calldata items, uint256 stage, uint256 bonus, uint256 power) internal view 
    returns(NFTPartProp memory niohAttack, NFTPartProp memory niohDefend, NFTPartProp memory kuniAttack, NFTPartProp memory kuniDefend, uint256 totalItem) {
    // power = _niohPower(stage, diffi);

    // NIOH
    (niohAttack, niohDefend) = _createNioh(stage, power);

    // Team
    (kuniAttack, kuniDefend) = meta.getPowerTeamNotTotal(tokenIds);
    (kuniAttack, kuniDefend, totalItem) = _addKuniItemWithTeam(kuniItem, items, kuniAttack, kuniDefend);

    if (bonus > 0) {
      kuniAttack = _addBonus(kuniAttack, bonus);
      kuniDefend = _addBonus(kuniDefend, bonus);
    }
  }

  function _advantagePoint(NFTPartProp memory _att, NFTPartProp memory _de) internal pure returns(uint256 score) {
    // for (uint256 inx = 0; inx < _attack.length; inx++) {
    //   score = score.add(_attack[inx].mul(_DECIMALS.mul(100 ether).div(_defend[inx].add(100 ether))));
    // }
    score = score.add(_calAdvantagePoint(_att.slash, _de.slash));
    score = score.add(_calAdvantagePoint(_att.heavy, _de.heavy));
    score = score.add(_calAdvantagePoint(_att.strike, _de.strike));
    score = score.add(_calAdvantagePoint(_att.tech, _de.tech));
    score = score.add(_calAdvantagePoint(_att.magic, _de.magic));
  }

  // // attack * (100/(100 + defend))
  function _calAdvantagePoint(uint256 _attack, uint256 _defend) internal pure returns(uint256) {
    return _attack.mul(_DECIMALS.mul(100 ether).div(_defend.add(100 ether)));
  }

  // CRAFT
  function materialStas(uint256 _pic, uint256 qty) override external view returns(uint256[] memory) {
    return _materialStas(_pic, qty);
  }

  function materialStasBatch(uint256[] calldata _mPic, uint256[] calldata qty) override external view returns(uint256[] memory) {
    return _materialStasBatch(_mPic, qty);
  }

  function _primaryStat(uint256[] calldata items) pure internal returns (uint256 m1) {
    m1 = 0;
    for (uint256 inx = 1; inx < items.length - 2; inx++) {
      if (items[m1] < items[inx]) {
        m1 = inx;
      }
    }
  }

  function _secondaryStat(uint256[] calldata items, uint256 m1) pure internal returns (uint256 m2) {
    uint256 val = type(uint256).min;
    for (uint256 inx = 0; inx < items.length - 1; inx++) {
      if (inx == m1) continue;
      if (items[inx] > val) {
        val = items[inx];
        m2 = inx;
      } 
    }
  }

  function _minorStat(uint256[] calldata items, uint256 m1, uint256 m2) pure internal returns (uint256 m3) {
    uint256 val = type(uint256).min;
    for (uint256 inx = 0; inx < items.length - 1; inx++) {
      if (inx == m1 || inx == m2) continue;
      if (items[inx] > val) {
        val = items[inx];
        m3 = inx;
      } 
    }
  }

  function toCraftNameCat(uint256[] calldata items, uint8 attack) override external view returns(string memory name, uint256 cat) {
    uint256 rs = 0;
    uint256 m1 = _primaryStat(items);
    uint256 m2 = _secondaryStat(items, m1);
    rs = rs.add(10000/10**m1);
    rs = rs.add(20000/10**m2);
    if (attack != 1) {
      uint256 m3 =_minorStat(items, m1, m2);
      rs = rs.add(30000/10**m3);
    }
    (name, cat) = meta.itemMetaBy(rs);
  }
  
  function _materialStas(uint256 _material, uint256 qty) internal view returns(uint256[] memory prop) {
    prop = meta.materialBy(_material);
    for (uint256 inx = 0; inx < prop.length; inx++) {
      prop[inx] = prop[inx].mul(qty).div(_DECIMALS);
    }
  }

  function _materialStasBatch(uint256[] calldata _materials, uint256[] calldata qty) internal view returns(uint256[] memory prop) {
    for (uint256 index = 0; index < _materials.length; index++) {
      uint256[] memory tmp = _materialStas(_materials[index], qty[index]);
      if (prop.length == 0) {
        prop = tmp;
      } else {
        for (uint256 inx = 0; inx < tmp.length; inx++) {
          prop[inx] = prop[inx].add(tmp[inx]);
        }
      }
    }
  }

  // new_bonus = current_bonus + (max_bonus - current_bonus)*k
  // current_bonus  + max * k/1000 - current_bonus * k/1000
  function battleBonusInc(uint256 cBonus) override external view returns(uint256 value, uint decimals) {
    if (cBonus > maxBonus) {
      cBonus = maxBonus;
    }
    value = cBonus.add(maxBonus.sub(cBonus).mul(kBonus).div(1e6));
    decimals = 4;
  }

  function calNioh(uint256 indx, uint256 value, uint256 power) internal pure returns(NFTPartProp memory item) {
    uint256[] memory stats = new uint256[](5); // = [slash, heavy, strike, tech, magic];
    for (uint256 index = 1; index <= stats.length; index++) {
      if (indx == index) {
        stats[index-1] = value * power / 100;
        break;
      }
    }
    item.slash  = stats[0];
    item.heavy  = stats[1];
    item.strike = stats[2];
    item.tech   = stats[3];
    item.magic  = stats[4];
  }

  function _createNioh(uint256 _stage, uint256 power) internal pure returns(NFTPartProp memory attack, NFTPartProp memory defend) {
    uint256 atk = _stage % 5 + 1;
    uint256 def = (_stage+1) % 5 + 1;
    attack = calNioh(atk, _stage % 2 == 0 ? 25 : 75, power);
    defend = calNioh(def, _stage % 2 == 0 ? 75 : 25, power);
  }

  function _addBonus(NFTPartProp memory v1, uint256 bonus) internal pure returns(NFTPartProp memory) {
    v1.slash  = v1.slash.add(v1.slash.mul(bonus).div(1e6));
    v1.heavy  = v1.heavy.add(v1.heavy.mul(bonus).div(1e6));
    v1.strike = v1.strike.add(v1.strike.mul(bonus).div(1e6));
    v1.tech   = v1.tech.add(v1.tech.mul(bonus).div(1e6));
    v1.magic  = v1.magic.add(v1.magic.mul(bonus).div(1e6));
    return v1;
  }

  function _addKuniItemWithTeam(address kuniItem, uint256[][] calldata items, NFTPartProp memory att, NFTPartProp memory def) view private 
    returns (NFTPartProp memory attack, NFTPartProp memory defend, uint256 total) {
    (attack, defend, total) = _getKuniItemPower(kuniItem, items);
    attack =  _plusProp(att, attack);
    defend =  _plusProp(def, defend);
  }

  function _plusProp(NFTPartProp memory v1, NFTPartProp memory v2) internal pure returns (NFTPartProp memory result) {
    result.slash  = v1.slash.add(v2.slash);
    result.heavy  = v1.heavy.add(v2.heavy);
    result.strike = v1.strike.add(v2.strike);
    result.tech   = v1.tech.add(v2.tech);
    result.magic  = v1.magic.add(v2.magic);
  }

  function _getKuniItemPower(address kuniItem, uint256[][] calldata items) view internal returns (NFTPartProp memory attack, NFTPartProp memory defend, uint256 total) {
    for (uint256 index = 0; index < items.length; index++) {
      for (uint256 j = 0; j < items[index].length; j++) {
        if (items[index][j] == 0) {
          continue;
        }
        total = total.add(1);
        uint256 slash; uint256 heavy; uint256 strike; uint256 tech; uint256	magic; uint256 cat;
        (, slash, heavy, strike, tech,	magic, cat) = IERC721Mint(kuniItem).getMeta(items[index][j]);
        if (cat == 1) {
          attack.slash  = attack.slash.add(slash);
          attack.heavy  = attack.heavy.add(heavy);
          attack.strike = attack.strike.add(strike);
          attack.tech   = attack.tech.add(tech);
          attack.magic  = attack.magic.add(magic);
        } else {
          defend.slash  = defend.slash.add(slash);
          defend.heavy  = defend.heavy.add(heavy);
          defend.strike = defend.strike.add(strike);
          defend.tech   = defend.tech.add(tech);
          defend.magic  = defend.magic.add(magic);
        }
      }
    }
    return (attack, defend, total);
  }

  function rewardPoint(uint256 stage, bool won, uint256 saru, uint256 item) external override pure returns(uint256) {
    if (won) {
      return stage.mul(10 ether);
    } else {
      return (stage.add(saru).add(item)).mul(1 ether);
    }
  }

  function getContinentalMultiplier(address acc) external view override returns(uint256, uint256, uint256, uint256) {
    uint256 land = uint256(uint160(acc)).mod(4).add(1);
    return (meta.getContinentalMultiplier(land, 1), meta.getContinentalMultiplier(land, 2), meta.getContinentalMultiplier(land, 3), meta.getContinentalMultiplier(land, 4));
  }
  // ore, stone, cotton, lumber 
  function getContinentalMultiplierArr(address acc) external view override returns(uint256[] memory lands) {
    uint256 land = uint256(uint160(acc)).mod(4).add(1);
    lands = new uint256[](4);
    lands[0] = meta.getContinentalMultiplier(land, 1);
    lands[1] = meta.getContinentalMultiplier(land, 2);
    lands[2] = meta.getContinentalMultiplier(land, 3);
    lands[3] = meta.getContinentalMultiplier(land, 4);
  }
}