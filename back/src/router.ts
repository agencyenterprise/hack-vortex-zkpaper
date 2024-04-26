import express from 'express';
import { getDocumentById, createSharedDocument, createDocument, uploadSharedDocument } from './controller';
import { verifySignature } from './utils/signatures';
const router = express.Router();

router.post("/document/share/keys/create", async (req, res) => {

    const { senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = await createSharedDocument(documentId, receiverPublicKey, senderPublicKey, senderAesKey, receiverAesKey)
    res.json({ message: sharedDocument });
})

router.post("/document/share/upload", async (req, res) => {

    const { content, documentId, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)

    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = await uploadSharedDocument(documentId, content)
    res.json({ message: sharedDocument });
})

router.post("/document/create", async (req, res) => {

    const { document, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)

    if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    if (!document) {
        return res.status(400).json({ message: "Missing document" });
    }
    const documentRecord = await createDocument(document)
    res.json({ message: documentRecord });
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

    res.json({ document });
});

export default router;