import circuit from "./work.json";
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

/**
 * @typedef {Object} ChangeInput
 * @property {number[]} x - A list containing the hash of the text and the users public key as number
 * @property {number} y - The previous hash of the text and the users public key as number
 */


/**
 * Gets change circuit
 * @returns {Noir}
 */
export const getChangeCircuit = () => {
    const backend = new BarretenbergBackend(circuit);
    return new Noir(circuit, backend);
}


/**
 * Generates proof of change
 * @typedef 
 * @param {ChangeInput} input 
 * @returns {Promise<ProofData?>} 
 */
export const generateChangeProof = async (input) => {
    try {
        const circuit = getChangeCircuit();
        const proof = await circuit.generateFinalProof(input);
        return proof;
    } catch (err) {
        return null
    }
}