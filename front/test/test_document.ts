import { expect } from "chai"
import pkg from 'hardhat';
const { ethers } = pkg;

describe("DocumentNFT", function () {
    let nft;
    let owner, addr1, addr2;

    beforeEach(async function () {
        // Get the ContractFactory and Signers
        const DocumentNFT = await ethers.getContractFactory("DocumentNFT");
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the contract
        nft = await DocumentNFT.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await nft.owner()).to.equal(owner.address);
        });
    });

    describe("Transactions", function () {
        it("Should mint one NFT to addr1", async function () {
            const price = { value: ethers.parseEther("0.01") };
            await nft.connect(addr1).mintArticle("Article 1", price);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);
            const uri = await nft.getTokenURI(tokenId);
            expect(uri).to.include("Article 1");

        });
        it("Should mint one NFT to addr1 and reduce the article's name size", async function () {
            const price = { value: ethers.parseEther("0.01") };
            const articleName = Array(100).fill("a").join("");
            await nft.connect(addr1).mintArticle(articleName, price);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);
            const uri = await nft.getTokenURI(tokenId);
            expect(uri).to.not.include(articleName);
            expect(uri).to.include(articleName.slice(0, 64));

        });
        it("Should throw error since tokenId does not exists", async function () {
            await expect(nft.getTokenURI(10))
                .to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

        });

        it("Should fail if ether sent is incorrect", async function () {
            const lowPrice = { value: ethers.parseEther("0.005") };
            await expect(nft.connect(addr1).mintArticle("Article 2", lowPrice))
                .to.be.revertedWith("Please submit the correct amount of ETH to purchase the NFT.");
        });
    });
});
