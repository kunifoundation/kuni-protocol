// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IScholarship.sol";

contract Scholarship is IERC721Receiver, IScholarship, ReentrancyGuard {
  using SafeMath for uint256;
	using EnumerableSet for EnumerableSet.UintSet;

  uint256 public constant PERCENT = 10000;
  struct ScholarInfo {
    address owner;
    uint256 rate;
  }
  
  // nft address -> owner -> list tokenId
  mapping(address => mapping(address=>EnumerableSet.UintSet)) private _nfts;
  mapping(address => mapping(uint256=>ScholarInfo)) public rateOf;

  function ask(address nftAddr, uint256 tokenId, uint256 rate) override external nonReentrant {
    require(nftAddr != address(0), 'Scholarship: address to the zero address');
    require(rate > 0 && rate <= PERCENT, "Scholarship: Rate > 0 && Rate <= 10000");
    _ask(nftAddr, tokenId, rate);
		emit Ask(nftAddr, msg.sender, tokenId, rate);
  }

  function cancel(address nftAddr, uint256 tokenId) override external nonReentrant {
    _cancel(nftAddr, tokenId);
    emit Cancel(nftAddr, msg.sender, tokenId);
  }

  function askBatch(address nftAddr, uint256[] calldata tokenIds, uint256[] calldata arrRate) override external nonReentrant {
    for (uint256 inx = 0; inx < tokenIds.length; inx++) {
      if (!_nfts[nftAddr][msg.sender].contains(tokenIds[inx]))
        _ask(nftAddr, tokenIds[inx], arrRate[inx]);
		}
    
    emit AskBatch(msg.sender, nftAddr, tokenIds, arrRate);
  }

  function cancelBatch(address nftAddr, uint256[] calldata tokenIds) override external nonReentrant {
    for (uint256 inx = 0; inx < tokenIds.length; inx++) {
      if (_nfts[nftAddr][msg.sender].contains(tokenIds[inx]))
        _deleteToken(nftAddr, tokenIds[inx]);
		}
    emit CancelBatch(nftAddr, msg.sender, tokenIds);
  }

  function _ask(address nftAddr, uint256 tokenId, uint256 rate) internal {
    if (!_nfts[nftAddr][msg.sender].contains(tokenId) && rate <= PERCENT) {
      IERC721(nftAddr).transferFrom(msg.sender, address(this), tokenId);
      _nfts[nftAddr][address(this)].add(tokenId);
      _nfts[nftAddr][msg.sender].add(tokenId);
      rateOf[nftAddr][tokenId] = ScholarInfo(msg.sender, rate);
    }
  }

  function _cancel(address nftAddr, uint256 tokenId) internal {
    ScholarInfo memory info = rateOf[nftAddr][tokenId];
    require(info.owner == msg.sender, 'Scholarship: You is not owner');
    require(_nfts[nftAddr][address(this)].contains(tokenId), 'Scholarship: Token not exists!');
    _deleteToken(nftAddr, tokenId);
  }

  function _deleteToken(address nftAddr, uint256 tokenId) internal {
     IERC721(nftAddr).transferFrom(address(this), msg.sender, tokenId);
    _nfts[nftAddr][address(this)].remove(tokenId);
    _nfts[nftAddr][msg.sender].remove(tokenId);
    delete rateOf[nftAddr][tokenId];
  }

  function ownerInfo(address nftAddr, uint256 tokenId) override external  view returns(address, uint256) {
    ScholarInfo memory info = rateOf[nftAddr][tokenId];
    return (info.owner, info.rate);
  }

  function allOf(address nftAddr) external view returns (uint256[] memory) {
    return _nfts[nftAddr][address(this)].values();
  }

  function valuesOf(address nftAddr, address sender) external view returns (uint256[] memory) {
    return _nfts[nftAddr][sender].values();
  }
  
  function at(address nftAddr, address sender, uint256 index) external view returns (uint256) {
    return _nfts[nftAddr][sender].at(index);
  }

  function balanceOf(address nftAddr, address sender) external view returns (uint256) {
    return _nfts[nftAddr][sender].length();
  }

  function _getTokenIdAt(address nftAddr, address sender, uint256 index) internal view returns(uint256) {
    return _nfts[nftAddr][sender].at(index);
  }

  function getScholars(address nftAddr, address sender, uint256 start, uint256 limit) external view virtual returns(uint256[] memory, address[] memory, uint256[] memory) {
    uint256 total = _nfts[nftAddr][sender].length();
    uint256 size = limit;
    if (start + limit > total) size = total - start;
    uint256[] memory tokenIds = new uint256[](size);
    address[] memory owners = new address[](size);
    uint256[] memory percents = new uint256[](size);
    for (uint256 i = 0; i < size; i++) {
      tokenIds[i] = _getTokenIdAt(nftAddr, sender, start + i);
      ScholarInfo memory info = rateOf[nftAddr][tokenIds[i]];
      owners[i] = info.owner;
      percents[i] = info.rate;
    }
    return (tokenIds, owners, percents);
  }

  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
	) public virtual override returns (bytes4) {
			return this.onERC721Received.selector;
	}
}