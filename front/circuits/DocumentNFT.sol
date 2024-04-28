// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DocumentNFT is ERC721Enumerable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public owner;
    uint256 private PRICE;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) private _subscriptions;
    uint256 private _itemsPerSubscription;

    constructor() ERC721("DocumentNFT", "DNFT") {
        owner = msg.sender;
        PRICE = 0.00001 ether;
        _itemsPerSubscription = 100;
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

    function hasSubscriptionOrDocumentsToMint(
        address subscriber
    ) public view returns (bool) {
        return _subscriptions[subscriber] > uint256(0);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        require(
            hasTokenURI(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    function changePrice(uint256 newPrice) public onlyOwner {
        PRICE = newPrice;
    }

    function mintArticle(string memory articleName) public nonReentrant {
        require(
            hasSubscriptionOrDocumentsToMint(msg.sender),
            "You need to purchase a subscription to mint a document"
        );
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        string memory slicedString = sliceString(articleName, 0, 64);
        _tokenURIs[newItemId] = formatTokenURI(slicedString);
        _subscriptions[msg.sender]--;
    }

    function paySubscription() public payable {
        require(
            msg.value == PRICE * _itemsPerSubscription,
            "Please submit the correct amount of ETH to purchase the NFT."
        );
        _subscriptions[msg.sender] += _itemsPerSubscription;
    }

    function transferNFT(address from, address to, uint256 tokenId) public {
        require(
            _exists(tokenId),
            "ERC721: transfer of token that does not exist"
        );
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner or approved"
        );
        _transfer(from, to, tokenId);
    }

    function formatTokenURI(
        string memory articleName
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    'data:application/json;utf8,{"name":"',
                    articleName,
                    '", "description":"A private zkPaper document"}'
                )
            );
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(owner).transfer(balance);
    }
}
