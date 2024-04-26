import express from 'express';
import { getDocumentById } from './controller';
import tweetnacl from 'tweetnacl';
import { verifySignature } from './utils/signatures';
const router = express.Router();

router.post("/document/share/keys/create", async (req, res) => {

    const { senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
    console.log({
        senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage
    })
    res.json({ message: verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature) });
})

router.post("/document/create", async (req, res) => {

    const { document, publicKey } = req.body;

    if (!document) {
        return res.status(400).json({ message: "Missing document" });
    }

    res.json({ message: "Ok" });
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