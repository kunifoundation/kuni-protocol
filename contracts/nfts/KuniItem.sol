// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../interfaces/IERC721Mint.sol";

contract KuniItem is ERC721("KuniItem", "KUNIITEM"), ERC721Enumerable, ERC721Burnable, Ownable, IERC721Mint {
    struct Meta {
        string name;
        uint256 slash;
        uint256 heavy;
        uint256 strike;
        uint256 tech;
        uint256 magic;
        uint256 cat; // 1: weapon, 2: head, 3: body, 4: eye, 5: hand
    }

    string private url;
    mapping(uint256 => uint256) public lastTokenIdOf;
    event Mint(address indexed owner, uint256 tokenId);
    event UpdateName(uint256 indexed tokenId, string name);
    mapping(uint256 => Meta) private _metadata;
    address private _minter;

    modifier onlyMinter() {
        require(msg.sender == _minter, "KuniItem: caller is not the minter!");
        _;
    }

    function setMinter(address minter_) public onlyOwner {
        _minter = minter_;
    }

    function currentId(uint256 eType) external view override returns (uint256) {
        return lastTokenIdOf[eType];
    }

    function safeMint(address to, string memory name, uint256[] memory meta, uint256 cat) external override onlyMinter {
        uint256 tokenId = cat;
        if (lastTokenIdOf[cat] != 0) {
            tokenId = lastTokenIdOf[cat] + 5;
        }
        lastTokenIdOf[cat] = tokenId;
        _metadata[tokenId] = Meta(name, meta[0], meta[1], meta[2], meta[3], meta[4], cat);
        _safeMint(to, tokenId);
        emit Mint(to, tokenId);
    }

    function getMeta(
        uint256 tokenId
    )
        external
        view
        override
        returns (string memory name, uint256 slash, uint256 heavy, uint256 strike, uint256 tech, uint256 magic, uint256 cat)
    {
        Meta memory meta = _metadata[tokenId];
        return (meta.name, meta.slash, meta.heavy, meta.strike, meta.tech, meta.magic, meta.cat);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setBaseUrl(string memory _uri) external onlyOwner {
        url = _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }
}
