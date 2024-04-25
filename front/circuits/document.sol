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
        _tokenURIs[newItemId] = articleName;
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
