// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IAmaInv.sol";
import "../interfaces/IEcoGame.sol";
import "../interfaces/IERC20Burnable.sol";
import "../interfaces/IERC721Mint.sol";
import "../nfts/KuniItem.sol";
import "../interfaces/IMiningKuni.sol";

contract AmaInv is IAmaInv, Ownable, Pausable, ReentrancyGuard {
  using SafeMath for uint256;
  
  mapping(address=>uint256) public materialPic;
  mapping(address => uint256) public currentCap;

  address public kuniItem;
  IEcoGame private eco;
  address public miningKuni;

  constructor(address _eco) {
    eco = IEcoGame(_eco);
  }

  function createKuniItem() external onlyOwner {
    kuniItem = address(new KuniItem());
  }
  
  function craft(address[] calldata _materials, uint256[] calldata amounts, uint8 cType) external override nonReentrant {
    _craft(_materials, amounts, cType);
  }

  function _craft(address[] calldata addr, uint256[] calldata amounts, uint8 attack) internal {
    if (miningKuni != address(0x0)) {
      IMiningKuni(miningKuni).gasStart();
    }
    require(addr.length > 0, 'Amatsu: Unable to process request!');
    uint256[] memory pic = new uint256[](addr.length);
    uint256 total = 0;
    for (uint256 index = 0; index < addr.length; index++) {
      if (materialPic[addr[index]] > 0 && amounts[index] > 1e12) {
        pic[index] = materialPic[addr[index]];
        total = total.add(amounts[index]);
        IERC20Burnable(addr[index]).burnFrom(msg.sender, amounts[index]);
      } else {
        revert('Amatsu: Material not support or qty low!');
      }
    }
    uint256 cap = _currentCapOf(msg.sender);
    require(total > 0 && total <= cap.mul(1e18), 'Amatsu: Materials Limit reached. Please reduce the number of materials');
    // slash; heavy; strike; tech; magic;
    uint256[] memory _stats = eco.materialStasBatch(pic, amounts);
    uint256[] memory stats = new uint256[](6); // = [slash, heavy, strike, tech, magic, type];
    string memory name;
    for (uint256 i = 0; i < _stats.length; i++) {
      stats[i] = _stats[i];
    }
    
    uint256 cat;
    (name, cat) = eco.toCraftNameCat(stats, attack);
    stats[5] = cat;
    require(keccak256(abi.encodePacked(name)) != keccak256(abi.encodePacked("")), "Amatsu: NAME_EMPTY");
    IERC721Mint(kuniItem).safeMint(msg.sender, name, stats);
    uint256 tokenId = IERC721Mint(kuniItem).currentId(cat);
    currentCap[msg.sender] = cap + 1;
    emit Craft(msg.sender, tokenId);
    if (miningKuni != address(0x0)) {
      IMiningKuni(miningKuni).gasEnd();
    }
  }

  function _currentCapOf(address acc) view internal returns(uint256) {
    return currentCap[acc] == 0 ? 10 : currentCap[acc];
  }

  function setMaterialPic(address[] calldata materialAddr, uint256[] calldata pic) external onlyOwner {
    for (uint256 index = 0; index < materialAddr.length; index++) {
      materialPic[materialAddr[index]] = pic[index];
    }
  }

  function setEco(address eco_) external onlyOwner {
    eco = IEcoGame(eco_);
  }

  function setKuniItem(address addr) external onlyOwner {
    kuniItem = addr;
  }

  function setMining(address mining_) external onlyOwner {
    miningKuni = mining_;
  }

  function currentCapOf(address acc) view override external returns(uint256) {
    return _currentCapOf(acc);
  }
}