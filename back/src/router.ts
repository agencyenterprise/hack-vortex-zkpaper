import express from 'express';
import { getDocumentById, createSharedDocument, createDocument, uploadSharedDocument, getUserByPublicKey, getUserDocuments, retrieveSharedDocument, getSharedDocuments, createUser } from './controller';
import { verifySignature } from './utils/signatures';
const router = express.Router();

router.post("/document/share/keys/create", async (req, res) => {

    const { senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    if (!senderAesKey) {
        return res.status(400).json({ message: "Missing senderAesKey" });
    }
    if (!receiverAesKey) {
        return res.status(400).json({ message: "Missing receiverAesKey" });
    }
    if (!documentId) {
        return res.status(400).json({ message: "Missing documentId" });
    }
    if (!senderPublicKey) {
        return res.status(400).json({ message: "Missing senderPublicKey" });
    }
    if (!receiverPublicKey) {
        return res.status(400).json({ message: "Missing receiverPublicKey" });
    }
    if (!receiverSignature) {
        return res.status(400).json({ message: "Missing receiverSignature" });
    }
    if (!receiverSignatureMessage) {
        return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    }

    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = await createSharedDocument(documentId, receiverPublicKey, senderPublicKey, senderAesKey, receiverAesKey)
    return res.json({ message: sharedDocument });
})


router.post("/me", async (req, res) => {

    const { userPublicKey, userSignature, userSignatureMessage, aesPrivateKey } = req.body;
    if (!userPublicKey) {
        return res.status(400).json({ message: "Missing userPublicKey" });
    }
    if (!userSignature) {
        return res.status(400).json({ message: "Missing userSignature" });
    }
    if (!userSignatureMessage) {
        return res.status(400).json({ message: "Missing userSignatureMessage" });
    }
    const isValidSignature = await verifySignature(userPublicKey, userSignatureMessage, userSignature)
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    let user = await getUserByPublicKey(userPublicKey);

    if (user) {
        return res.status(200).json({ message: { user: user } });
    }
    const registeredUser = await createUser(userPublicKey, aesPrivateKey);
    return res.json({ message: { user: registeredUser } });
})

router.post("/me/:id", async (req, res) => {

    const { userSignature, userSignatureMessage } = req.body;
    const { id: userPublicKey } = req.params;
    if (!userPublicKey) {
        return res.status(400).json({ message: "Missing userPublicKey" });
    }
    if (!userSignature) {
        return res.status(400).json({ message: "Missing userSignature" });
    }
    if (!userSignatureMessage) {
        return res.status(400).json({ message: "Missing userSignatureMessage" });
    }
    const isValidSignature = await verifySignature(userPublicKey, userSignatureMessage, userSignature)
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const user = await getUserByPublicKey(userPublicKey);

    if (!user) {
        return res.json({ message: { user: null } });
    }
    return res.json({ message: { user } });
})


router.post("/document/share/upload", async (req, res) => {

    const { content, documentId, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    if (!content) {
        return res.status(400).json({ message: "Missing content" });
    }
    if (!documentId) {
        return res.status(400).json({ message: "Missing documentId" });
    }
    if (!receiverPublicKey) {
        return res.status(400).json({ message: "Missing receiverPublicKey" });
    }
    if (!receiverSignature) {
        return res.status(400).json({ message: "Missing receiverSignature" });
    }
    if (!receiverSignatureMessage) {
        return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    }

    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = await uploadSharedDocument(documentId, content)
    return res.json({ message: sharedDocument });
})

router.post("/document/share/:id", async (req, res) => {

    const { documentId, receiverPublicKey, receiverSignature, receiverSignatureMessage, senderPublicKey } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Missing id" });
    }
    if (!documentId) {
        return res.status(400).json({ message: "Missing documentId" });
    }
    if (!receiverPublicKey) {
        return res.status(400).json({ message: "Missing receiverPublicKey" });
    }
    if (!receiverSignature) {
        return res.status(400).json({ message: "Missing receiverSignature" });
    }
    if (!receiverSignatureMessage) {
        return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    }
    if (!senderPublicKey) {
        return res.status(400).json({ message: "Missing senderPublicKey" });
    }
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = retrieveSharedDocument(id, receiverPublicKey, senderPublicKey)
    if (!sharedDocument) {
        return res.status(404).json({ message: "Shared Document not found" });
    }

    return res.json({ message: sharedDocument });
})

router.post("/document/shares", async (req, res) => {

    const { receiverPublicKey, receiverSignature, receiverSignatureMessage, senderPublicKey } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    if (!receiverPublicKey) {
        return res.status(400).json({ message: "Missing receiverPublicKey" });
    }
    if (!receiverSignature) {
        return res.status(400).json({ message: "Missing receiverSignature" });
    }
    if (!receiverSignatureMessage) {
        return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    }
    if (!senderPublicKey) {
        return res.status(400).json({ message: "Missing senderPublicKey" });
    }
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }

    const sharedDocument = getSharedDocuments(receiverPublicKey, senderPublicKey)
    if (!sharedDocument) {
        return res.status(404).json({ message: "Shared Document not found" });
    }

    return res.json({ message: sharedDocument });
})

router.post("/document/create", async (req, res) => {

    const { proofOfWork, document, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    let { documentTitle } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    if (!receiverPublicKey) {
        return res.status(400).json({ message: "Missing receiverPublicKey" });
    }
    if (!documentTitle) {
        documentTitle = "Untitled"
    }
    if (!proofOfWork) {
        return res.status(400).json({ message: "Missing proofOfWork" });
    }
    if (!receiverSignature) {
        return res.status(400).json({ message: "Missing receiverSignature" });
    }
    if (!receiverSignatureMessage) {
        return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    }
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    if (!document) {
        return res.status(400).json({ message: "Missing document" });
    }
    const documentRecord = await createDocument(document, proofOfWork, documentTitle)
    return res.json({ message: documentRecord });
});

router.get("/document/:id", async (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Missing id" });
    }

    const document = await getDocumentById(id);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }

    return res.json({ document });
});

router.post("/documents", async (req, res) => {

    const { userPublicKey, userSignature, userSignatureMessage } = req.body;
    let { limit, skip } = req.body;
    if (!userPublicKey) {
        return res.status(400).json({ message: "Missing userPublicKey" });
    }
    if (!userSignature) {
        return res.status(400).json({ message: "Missing userSignature" });
    }
    if (!userSignatureMessage) {
        return res.status(400).json({ message: "Missing userSignatureMessage" });
    }
    const isValidSignature = await verifySignature(userPublicKey, userSignatureMessage, userSignature)
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const user = await getUserByPublicKey(userPublicKey);

    if (!user) {
        return res.json({ message: { user: null } });
    }

    const documents = await getUserDocuments(userPublicKey, limit, skip);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: { documents } });
});




export default router;