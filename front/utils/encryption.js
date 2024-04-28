import { encrypt } from "./cryptography"
import * as sigUtil from '@metamask/eth-sig-util'
import Aes from "crypto-js/aes";
import Utf8Encoding from 'crypto-js/enc-utf8'
import crypto from "crypto";
import CryptoJS from "crypto-js";
export function generateSecret(size = 32) {
    const secret = crypto.randomBytes(size)
    return { secretBuffer: secret, secret: bufferToString(secret) };
}

export async function aesEncryptMessage(message, secret) {
    return Aes.encrypt(message, secret).toString()
    // let encJson = CryptoJS.AES.encrypt(JSON.stringify(message), secret).toString();
    // return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
}

export function aesDecryptMessage(encryptedMessage, secret) {
    console.log(encryptedMessage, secret, 'encryptedMessage, secret')
    return Aes.decrypt(encryptedMessage, secret).toString(Utf8Encoding)
    // let decData = CryptoJS.enc.Base64.parse(encryptedMessage).toString(CryptoJS.enc.Utf8);
    // return CryptoJS.AES.decrypt(decData, secret).toString(CryptoJS.enc.Utf8);
}

export function bufferToString(buffer) {
    return buffer.toString('hex')
}
// export function decryptWithWallet(encryptedText, privateKey) {

//     const encryptedObj = JSON.parse(encryptedText)
//     console.log(encryptedObj, 'encryptedObj')
//     const decryptedString = sigUtil.decrypt(
//         {
//             encryptedData: encryptedObj,
//             privateKey: privateKey,
//         }
//     )
//     return decryptedString
// }


export async function decryptWithWallet(encryptedMessage, userPubKey) {
    return await window["ethereum"]
        .request({
            method: 'eth_decrypt',
            params: [encryptedMessage, userPubKey],
        })

}


export function encryptWithWallet(plainText, publicKey) {
    const encryptedObj = sigUtil.encrypt({
        publicKey: publicKey,
        data: plainText,
        version: 'x25519-xsalsa20-poly1305'
    })
    console.log(encryptedObj, 'encryptedObj')
    const encryptedText = JSON.stringify(encryptedObj)
    return encryptedText
}

export function encryptConst(plainText, publicKey) {

    const encryptedObj = encrypt({
        publicKey: publicKey,
        data: plainText,
        version: 'x25519-xsalsa20-poly1305'
    })
    console.log(encryptedObj)
    return encryptedObj.ciphertext
}