import circuit from "./work.json";
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

/**
 * @typedef {Object} WorkInput
 * @property {number} num_writes - Number of chars written in the document
 * @property {number} num_pastes - Number of chars pasted in the document 
 */


/**
 * Gets work circuit
 * @returns {Noir}
 */
export const getWorkCircuit = () => {
    const backend = new BarretenbergBackend(circuit);
    return new Noir(circuit, backend);
}


/**
 * Generates proof of work
 * @typedef 
 * @param {WorkInput} input 
 * @returns {Promise<ProofData?>} 
 */
export const generateWorkProof = async (input) => {
    try {
        const circuit = getWorkCircuit();
        const proof = await circuit.generateProof(input);
        return proof;
    } catch (err) {
        console.log(err)
        return null
    }
}