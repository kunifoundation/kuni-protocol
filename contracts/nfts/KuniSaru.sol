// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract KuniSaru is ERC721, ERC721Enumerable, Pausable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    string private url;

    constructor() ERC721("Kuni Saru", "KUNI") {
        _tokenIdCounter.increment();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function safeMint(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function setBaseUrl(string memory _uri) external onlyOwner {
        url = _uri;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }
}
