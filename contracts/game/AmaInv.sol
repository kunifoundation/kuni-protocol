// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAmaInv.sol";
import "../interfaces/IEcoGame.sol";
import "../interfaces/IERC721Mint.sol";
import "../nfts/KuniItem.sol";
import "../interfaces/IMiningKuni.sol";

contract AmaInv is IAmaInv, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(address => uint256) public materialPic;
    mapping(address => uint256) public currentCap;
    uint256 CAP_INIT = 10;
    uint256 STEP = 1;

    address public kuniItem;
    IEcoGame private eco;
    address public miningKuni;

    constructor(address miningAddr_, address eco_, address kuniItem_) {
        eco = IEcoGame(eco_);
        miningKuni = miningAddr_;
        kuniItem = kuniItem_;
    }

    function createKuniItem() external onlyOwner {
        kuniItem = address(new KuniItem());
    }

    function craft(address[] calldata _materials, uint256[] calldata amounts, uint8 cType) external override nonReentrant {
        _craft(_materials, amounts, cType);
    }

    function _craft(address[] calldata addr, uint256[] calldata amounts, uint8 attack) internal {
        IMiningKuni(miningKuni).gasStart();
        require(addr.length > 0, "KUNI: Unable to process request!");
        uint256[] memory pic = new uint256[](addr.length);
        uint256 total = 0;
        for (uint256 index = 0; index < addr.length; index++) {
            if (materialPic[addr[index]] > 0 && amounts[index] > 1e12) {
                pic[index] = materialPic[addr[index]];
                total = total.add(amounts[index]);
                IERC20(addr[index]).safeTransferFrom(address(msg.sender), address(this), amounts[index]);
            } else {
                revert("KUNI: Not support or qty low!");
            }
        }
        uint256 cap = _currentCapOf(msg.sender);
        require(total > 0 && total <= cap.mul(1e18), "KUNI: Materials Limit reached. Please reduce the number of materials");
        uint256[] memory stats = eco.materialStasBatch(pic, amounts); // slash, heavy, strike, tech, magic
        (string memory name, uint256 cat) = eco.toCraftNameCat(stats, attack);
        require(keccak256(abi.encodePacked(name)) != keccak256(abi.encodePacked("")), "KUNI: NAME_EMPTY");
        IERC721Mint(kuniItem).safeMint(msg.sender, name, stats, cat);
        uint256 tokenId = IERC721Mint(kuniItem).currentId(cat);
        currentCap[msg.sender] = cap + STEP;
        emit Craft(msg.sender, tokenId);
        IMiningKuni(miningKuni).gasEnd();
    }

    function _currentCapOf(address acc) internal view returns (uint256) {
        return currentCap[acc] == 0 ? CAP_INIT : currentCap[acc];
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

    function currentCapOf(address acc) external view override returns (uint256) {
        return _currentCapOf(acc);
    }
}
