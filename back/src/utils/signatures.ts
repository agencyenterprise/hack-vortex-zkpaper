import { ethers } from 'ethers';

export async function verifySignature(expectedAddress: string, message: string, signature: string) {
    // Format the message as MetaMask does for signed messages
    const prefixedMessage = `\x19Ethereum Signed Message:\n${message.length}${message}`;
    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(prefixedMessage));

    // Recover the address from the signature
    const recoveredAddress = ethers.utils.recoverAddress(ethers.utils.arrayify(messageHash), signature);

    // Compare the recovered address with the expected address
    if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
        console.log('Signature is valid.');
        return true;
    } else {
        console.log('Signature is invalid.');
        return false;
    }


}