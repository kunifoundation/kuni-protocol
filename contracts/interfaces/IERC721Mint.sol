// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IERC721Mint {
    function safeMint(address to, string memory name, uint256[] memory meta) external;
    function currentId(uint256 eType) external view returns (uint256);
    function getMeta(
        uint256 tokenId
    )
        external
        view
        returns (string memory name, uint256 slash, uint256 heavy, uint256 strike, uint256 tech, uint256 magic, uint256 cat);
}
