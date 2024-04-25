// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DocumentNFT is ERC721Enumerable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public owner;
    uint256 public constant PRICE = 0.01 ether;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("ArticleNFT", "ANFT") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function sliceString(
        string memory str,
        uint startIndex,
        uint endIndex
    ) public pure returns (string memory) {
        require(
            endIndex > startIndex,
            "End index must be greater than start index."
        );
        bytes memory strBytes = bytes(str);
        if (endIndex > strBytes.length) {
            endIndex = strBytes.length;
        }
        if (endIndex > 64) {
            endIndex = 64;
        }

        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    function hasTokenURI(uint256 tokenId) public view returns (bool) {
        return bytes(_tokenURIs[tokenId]).length > 0;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        require(
            hasTokenURI(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    function mintArticle(
        string memory articleName
    ) public payable nonReentrant {
        require(
            msg.value == PRICE,
            "Please submit the correct amount of ETH to purchase the NFT."
        );
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        string memory slicedString = sliceString(articleName, 0, 64);
        _tokenURIs[newItemId] = formatTokenURI(slicedString);
    }

    function formatTokenURI(
        string memory articleName
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    'data:application/json;utf8,{"name":"',
                    articleName,
                    '", "description":"An NFT based on an article.", "image":"", "attributes":""}'
                )
            );
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(owner).transfer(balance);
    }
}
