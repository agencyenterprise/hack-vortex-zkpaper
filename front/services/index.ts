import axios from 'axios';
import { toast } from 'react-toastify';
import { generateSecret, encryptWithWallet, decryptWithWallet, aesEncryptMessage } from '../utils/encryption'
import { db } from './db'
import { runProof } from '../hooks/useProofGeneration';
import { VITE_API_URL } from './url';
const client = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})
const error = (action: string) => toast(`${action}: Error performing this request! Please try again later.`, { type: "error" });
const success = (action: string) => toast(`${action}: Request successful!`, { type: "success" });

export const me = async (userPublicKey: string, userSignature: string, userSignatureMessage: string) => {
    try {
        const response = await client.post(`/me/${userPublicKey}`, {
            userSignature,
            userSignatureMessage
        })

        return response.data
    } catch (err) {
        return null
    }
}
export const createDocument = async (receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, contentTitle: string = "Untitled",) => {
    try {
        const response = await client.post('/document/create', {
            contentTitle,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage
        })
        success("Create document")
        return response.data.message.insertedId
    } catch (err) {
        error("Create document")
        return null
    }
}

export const appendDocument = async (receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, userEncryptionKey: string, externalId: string) => {
    try {
        await registeredUser(receiverPublicKey, receiverSignature, receiverSignatureMessage, userEncryptionKey)
        const documentRecord = await getLocalDocument(externalId)
        const documentContent = documentRecord?.content
        const proofOfWork = await runProof({ num_writes: +(documentRecord?.num_writes || 0) as number, num_pastes: 0 }, "work")
        const user = await me(receiverPublicKey, receiverSignature, receiverSignatureMessage)
        if (!user) {
            throw new Error("User not found")
        }
        const secret = user.message.user.secretKey;
        const decryptedAesKey = await decryptWithWallet(secret, receiverPublicKey)
        const document = await aesEncryptMessage(documentContent!, decryptedAesKey)
        const response = await client.post('/document/append', {
            document,
            documentId: externalId,
            proofOfWork,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage,
            documentTitle: documentRecord?.contentTitle || ""
        })
        success("Append document")
        return response.data
    } catch (err) {
        console.log(err)
        error("Append document")
        return null
    }
}

export const uploadSharedDocument = async (content: string, sharedDocumentId: string, documentId: string, receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string) => {
    try {
        const response = await client.post('/document/share/upload', {
            content,
            sharedDocumentId,
            documentId,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage
        })
        success("Upload shared document")
        return response.data
    } catch (err) {
        error("Upload shared document")
        return null
    }
}

export const createSharedDocument = async (documentId: string, receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, senderAesKey: string, receiverAesKey: string, senderPublicKey: string, senderEncryptionKey: string) => {
    try {
        //senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage
        const response = await client.post('/document/share/keys/create', {
            documentId,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage,
            senderPublicKey,
            senderEncryptionKey,
            senderAesKey, receiverAesKey,
        })
        success("Create shared document")
        return response.data
    } catch (err) {
        error("Create shared document")
        return null
    }
}

export const getDocumentById = async (documentId: string) => {
    try {
        const response = await client.get(`/document/${documentId}`)
        return response.data
    } catch (err) {
        return null
    }
}
export const getUserDocuments = async (address: string, signature: string, message: string) => {
    try {
        const response = await client.post(`/documents`, {
            userPublicKey: address,
            userSignature: signature,
            userSignatureMessage: message
        })
        return response.data
    } catch (err) {
        return null
    }
}

export const retrieveSharedDocumentById = async (sharedDocumentId: string, documentId: string, receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, senderPublicKey: string) => {
    try {
        const response = await client.post(`/document/share/${sharedDocumentId}`, {
            documentId, receiverPublicKey, receiverSignature, receiverSignatureMessage, senderPublicKey
        })
        success("Retrieve shared document")
        return response.data
    } catch (err) {
        error("Retrieve shared document")
        return null
    }
}

export const getSharedDocuments = async (receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, senderPublicKey: string) => {
    try {
        const response = await client.post(`/document/shares`, {
            receiverPublicKey, receiverSignature, receiverSignatureMessage
        })
        success("Retrieve shared document")
        return response.data
    } catch (err) {
        error("Retrieve shared document")
        return null
    }
}


export const registeredUser = async (userPublicKey: string, userSignature: string, userSignatureMessage: string, encryptionKey: string) => {
    try {
        const { secret } = generateSecret(16)
        const aesPrivateKey = encryptWithWallet(secret, encryptionKey)
        const response = await client.post('/me', {
            userPublicKey,
            userSignature,
            userSignatureMessage,
            aesPrivateKey
        })
        success("Register user")
        return response.data
    } catch (err) {
        error("Register user")
        return null
    }
}

export const getTabID = () => {
    return sessionStorage.tabID ?
        sessionStorage.tabID :
        sessionStorage.tabID = Math.random();
}


export const addLocalDocument = async (document: string, contentTitle: string, pubkey: string, num_writes: number, num_pastes: number, externalId: string) => {
    const documentRecord = await db.documents.get(externalId);
    if (documentRecord) {
        await db.documents.update(externalId, {
            content: document,
            contentTitle,
            pubkey,
            num_writes,
            num_pastes,
            externalId,
        });
        return externalId;
    }
    const id = await db.documents.add({
        id: externalId,
        content: document,
        contentTitle,
        pubkey,
        num_writes,
        num_pastes,
        externalId
    });
    return id;
}

export const getLocalDocument = async (id: string) => {
    return db.documents.get(id);
}