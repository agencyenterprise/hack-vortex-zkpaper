import express from 'express';
import { getDocumentById } from './controller';

const router = express.Router();

router.post("/document/share/keys/create", async (req, res) => {

    // const receiverPublicKey = req.headers["public-key"];
    const { aesKey, documentId, senderPublicKey } = req.body;
    
    

    res.json({ message: "Ok" });
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