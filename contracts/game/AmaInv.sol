// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAmaInv.sol";
import "../interfaces/IEcoGame.sol";
import "../interfaces/IERC721Mint.sol";
import "../interfaces/IMiningKuni.sol";

contract AmaInv is IAmaInv, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(address => uint256) public materialPic;
    mapping(address => uint256) public currentCap;
    
    uint256 CAP_INIT = 20;
    uint256 STEP = 2;

    address public kuniItem;
    IEcoGame private eco;
    address public miningKuni;

    constructor(address miningAddr_, address eco_, address kuniItem_) {
        eco = IEcoGame(eco_);
        miningKuni = miningAddr_;
        kuniItem = kuniItem_;
    }

    function craft(address[] calldata _materials, uint256[] calldata amounts, uint8 cType) external override nonReentrant {
        IMiningKuni(miningKuni).gasStart();
        _craft(_materials, amounts, cType);
        IMiningKuni(miningKuni).gasEnd();
    }

    function _craft(address[] calldata addr, uint256[] calldata amounts, uint8 attack) internal {
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
        (string memory name, uint256[] memory stats, uint256 cat) = eco.callCraft(pic, amounts, cap, total, attack);
        IERC721Mint(kuniItem).safeMint(msg.sender, name, stats, cat);
        uint256 tokenId = IERC721Mint(kuniItem).currentId(cat);
        currentCap[msg.sender] = cap.add(STEP);
        emit Craft(msg.sender, tokenId);
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

    function currentCapOf(address acc) external view override returns (uint256) {
        return _currentCapOf(acc);
    }
}
