import { expect } from 'chai';
import pkg from 'hardhat';
const { ethers } = pkg;
import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';

import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit, ProofData } from '@noir-lang/types';
import { join, resolve } from 'path';

async function getCircuit() {
  const basePath = resolve(join('./circuits/change'));
  const fm = createFileManager(basePath);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let noir: Noir;
  let correctProof: ProofData;

  before(async () => {
    const compiled = await getCircuit();
    //const verifierContract = await ethers.deployContract('ChangeUltraVerifier');
    const verifierContract = await ethers.getContractFactory("ChangeUltraVerifier");

    // Deploy the contract
    const contract = await verifierContract.deploy();
    const verifierAddr = contract.address;
    //const verifierAddr = verifierContract.address;
    console.log(`Verifier deployed to ${verifierAddr}`);

    // @ts-ignore
    const backend = new BarretenbergBackend(compiled);
    // @ts-ignore
    noir = new Noir(compiled, backend);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: [1, 2], y: "7853200120776062878684798364095072458815029376092732009249414926327459813530" };
    // Generate proof
    correctProof = await noir.generateProof(input);
    expect(correctProof.proof instanceof Uint8Array).to.be.true;
  });

  it('Should verify valid proof for correct input', async () => {
    const verification = await noir.verifyProof(correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: [1, 2], y: 0 };
      const incorrectProof = await noir.generateProof(input);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this test to be
      expect(err instanceof Error).to.be.true;
      const error = err as Error;
      expect(error.message).to.contain('Cannot satisfy constraint');
    }
  });
});
