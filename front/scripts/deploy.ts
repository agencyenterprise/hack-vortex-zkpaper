import { writeFileSync } from 'fs';
import pkg from "hardhat"
const { ethers, viem } = pkg;

async function main() {
  const publicClient = await viem.getPublicClient();
  const document = await (await ethers.getContractFactory("DocumentNFT")).deploy();
  //const change = await (await ethers.getContractFactory("ChangeUltraVerifier")).deploy();
  //const work = await (await ethers.getContractFactory("WorkUltraVerifier")).deploy();
  // Create a config object
  const config = {
    chainId: publicClient.chain.id,
    //work: work.address,
    //change: change.address,
    document: document.address,
  };

  // Print the config
  console.log("Deployed at", config);
  writeFileSync("utils/addresses.json", JSON.stringify(config), { flag: "w" });
  process.exit();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
