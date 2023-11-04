// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IScholarship {
  /* ========== EVENTS ========== */
  event Ask(address indexed nftAddr, address indexed owner, uint256 tokenId, uint256 rate);
  event AskBatch(address indexed owner, address nftAddr, uint256[] tokenIds, uint256[] arrRate);
  event Cancel(address indexed nftAddr, address indexed sender, uint256 tokenId);
  event CancelBatch(address indexed nftAddr, address indexed sender, uint256[] tokenIds);
  
  /* ========== FUNCTIONS ========== */
  function ask(address nftAddr, uint256 tokenId, uint256 rate) external;
  function cancel(address nftAddr, uint256 tokenId) external;
  function ownerInfo(address nftAddr, uint256 tokenId) external view returns(address, uint256);
  function cancelBatch(address nftAddr, uint256[] calldata tokenIds) external;
  function askBatch(address nftAddr, uint256[] calldata tokenIds, uint256[] calldata arrRate) external;
}