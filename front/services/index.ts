import axios from 'axios';
import { toast } from 'react-toastify';
import { generateSecret, encryptWithWallet, decryptWithWallet, aesEncryptMessage } from '../utils/encryption'
import { db } from './db'
import { runProof } from '../hooks/useProofGeneration';
const client = axios.create({
    baseURL: 'http://localhost:3001/api',
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
        success("Retrieve user")
        return response.data
    } catch (err) {
        error("Retrieve user")
        return null
    }
}

export const createDocument = async (receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string, userEncryptionKey: string = "") => {
    try {
        const tabID = getTabID();
        if (userEncryptionKey) {
            console.log("Running registeredUser")
            await registeredUser(receiverPublicKey, receiverSignature, receiverSignatureMessage, userEncryptionKey)
        }
        console.log("Running addLocalDocument")
        const documentRecord = await getLocalDocument(tabID)
        const documentContent = documentRecord?.content
        console.log("running proof of work")
        const proofOfWork = await runProof({ num_writes: +(documentRecord?.num_writes || 0) as number, num_pastes: 0 }, "work")
        console.log("Running me")
        const user = await me(receiverPublicKey, receiverSignature, receiverSignatureMessage)
        if (!user) {
            throw new Error("User not found")
        }
        const secret = user.message.user.secretKey;
        console.log(user)
        console.log("decrypting...")
        const decryptedAesKey = await decryptWithWallet(secret, receiverPublicKey)
        console.log(decryptedAesKey, 'decryptedAesKey')
        console.log("encrypting...")
        const document = await aesEncryptMessage(documentContent!, decryptedAesKey)
        console.log(document, 'encryptedDocument')
        const response = await client.post('/document/create', {
            document,
            proofOfWork,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage,
            documentTitle: documentRecord?.contentTitle || ""
        })
        success("Create document")
        console.log(response)
        await addLocalDocument(documentContent!, documentRecord?.contentTitle || "", receiverPublicKey, +(documentRecord?.num_writes || 0), 0, response.data.message.insertedId)
        console.log("External ID added!")
        return response.data
    } catch (err) {
        console.log(err)
        error("Create document")
        return null
    }
}

export const uploadSharedDocument = async (content: string, documentId: string, receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string) => {
    try {
        const response = await client.post('/document/share/upload', {
            content,
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

export const createSharedDocument = async (documentId: string, receiverPublicKey: string, receiverSignature: string, receiverSignatureMessage: string) => {
    try {
        const response = await client.post('/document/share/keys/create', {
            documentId,
            receiverPublicKey,
            receiverSignature,
            receiverSignatureMessage
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
        success("Retrieve document")
        return response.data
    } catch (err) {
        error("Retrieve document")
        return null
    }
}

export const retrieveSharedDocumentById = async (sharedDocumentId: string) => {
    try {
        const response = await client.get(`/document/share/${sharedDocumentId}`)
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


export const addLocalDocument = async (document: string, contentTitle: string, pubkey: string, num_writes: number, num_pastes: number, externalId?: string) => {

    const tabID = getTabID();
    const documentRecord = await db.documents.get(tabID);
    //console.log(documentRecord, document, contentTitle, pubkey)
    if (documentRecord) {
        await db.documents.update(tabID, {
            content: document,
            contentTitle,
            pubkey,
            num_writes,
            num_pastes,
            externalId,
        });
        return tabID;
    }
    const id = await db.documents.add({
        id: tabID,
        content: document,
        contentTitle,
        pubkey,
        num_writes,
        num_pastes
    });
    return id;
}

export const getLocalDocument = async (id: number) => {
    return db.documents.get(id);
}