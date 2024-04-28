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
            const price = { value: ethers.utils.parseEther("0.01") };
            await nft.connect(addr1).paySubscription(price);
            await nft.connect(addr1).mintArticle("Article 1");
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);
            const uri = await nft.getTokenURI(tokenId);
            expect(uri).to.include("Article 1");

        });
        it("Should not mint because user does not have more credits", async function () {
            const price = { value: ethers.utils.parseEther("0.01") };
            await nft.connect(addr1).paySubscription(price);
            for await (const i of Array(10).keys()) {
                await nft.connect(addr1).mintArticle(`Article ${i}`);
                expect(await nft.balanceOf(addr1.address)).to.equal(i + 1);
                const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, i);
                const uri = await nft.getTokenURI(tokenId);
                expect(uri).to.include(`Article ${i}`);
            }
            await expect(nft.connect(addr1).mintArticle("Article 11"))
                .to.be.revertedWith("You need to purchase a subscription to mint a document");
        });
        it("Should mint after user replenished credits", async function () {
            const price = { value: ethers.utils.parseEther("0.01") };
            await nft.connect(addr1).paySubscription(price);
            for await (const i of Array(10).keys()) {
                await nft.connect(addr1).mintArticle(`Article ${i}`);
                expect(await nft.balanceOf(addr1.address)).to.equal(i + 1);
                const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, i);
                const uri = await nft.getTokenURI(tokenId);
                expect(uri).to.include(`Article ${i}`);
            }
            await nft.connect(addr1).paySubscription(price);
            await nft.connect(addr1).mintArticle(`Article 11`);
            expect(await nft.balanceOf(addr1.address)).to.equal(11);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 10);
            const uri = await nft.getTokenURI(tokenId);
            expect(uri).to.include(`Article 11`);
        });
        it("Should not mint because user has no subscription", async function () {
            await expect(nft.connect(addr1).mintArticle("Article 1"))
                .to.be.revertedWith("You need to purchase a subscription to mint a document");
        });
        it("Should mint one NFT to addr1 and reduce the article's name size", async function () {
            const price = { value: ethers.utils.parseEther("0.01") };
            await nft.connect(addr1).paySubscription(price);
            const articleName = Array(100).fill("a").join("");
            await nft.connect(addr1).mintArticle(articleName);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);
            const uri = await nft.getTokenURI(tokenId);
            expect(uri).to.not.include(articleName);
            expect(uri).to.include(articleName.slice(0, 64));

        });
        it("Should mint, approve, and transfer an NFT", async function () {
            const price = { value: ethers.utils.parseEther("0.01") };
            const articleName = "Example Article Name";
            await nft.connect(addr1).paySubscription(price);
            // Minting the NFT to addr1
            await nft.connect(addr1).mintArticle(articleName);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);

            // Approving addr2 to manage the NFT owned by addr1
            await nft.connect(addr1).approve(addr2.address, tokenId);

            // Checking approval
            expect(await nft.getApproved(tokenId)).to.equal(addr2.address);

            // addr2 now transfers the NFT from addr1 to itself
            await nft.connect(addr2).transferFrom(addr1.address, addr2.address, tokenId);

            // Check balances to confirm transfer
            expect(await nft.balanceOf(addr1.address)).to.equal(0);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);

            // Verify the ownership transfer
            expect(await nft.ownerOf(tokenId)).to.equal(addr2.address);
        });
        it("Should mint, and should not transfer an NFT", async function () {
            const price = { value: ethers.utils.parseEther("0.01") };
            const articleName = "Example Article Name";
            await nft.connect(addr1).paySubscription(price);
            // Minting the NFT to addr1
            await nft.connect(addr1).mintArticle(articleName);
            const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, 0);
            await expect(nft.connect(addr2).transferFrom(addr1.address, addr2.address, tokenId))
                .to.be.revertedWith("ERC721: caller is not token owner or approved");

        });
        it("Should throw error since tokenId does not exists", async function () {
            await expect(nft.getTokenURI(10))
                .to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

        });

        it("Should fail if ether sent is incorrect", async function () {
            const lowPrice = { value: ethers.utils.parseEther("0.005") };
            await expect(nft.connect(addr1).paySubscription(lowPrice))
                .to.be.revertedWith("Please submit the correct amount of ETH to purchase the NFT.");
        });
    });
});
