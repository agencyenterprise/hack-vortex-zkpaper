import { writeFileSync } from 'fs';
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const document = await (await ethers.getContractFactory("DocumentNFT")).deploy();
  const change = await (await ethers.getContractFactory("ChangeUltraVerifier")).deploy();
  const work = await (await ethers.getContractFactory("WorkUltraVerifier")).deploy();
  // Create a config object
  const config = {
    chainId: 0,//publicClient.chain.iSd,
    //verifier: verifier.address,
    work: work.address,
    change: change.address,
    document: document.address,
  };

  // Print the config
  console.log('Deployed at', config);
  writeFileSync('utils/addresses.json', JSON.stringify(config), { flag: 'w' });
  process.exit();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
