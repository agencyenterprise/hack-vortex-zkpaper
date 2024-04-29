import express from 'express';
import { getDocumentById, createSharedDocument, appendDocument, uploadSharedDocument, getUserByPublicKey, getUserDocuments, retrieveSharedDocument, getSharedDocuments, createUser, createDocument, getDocumentByIdAndPublicKey } from './controller';
import { verifySignature } from './utils/signatures';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ScrollSepoliaTestnet } from "@thirdweb-dev/chains"
import ABI from "./utils/DocumentNFT.json"
const hasSubscription = async (publicKey: string) => {
    try {
        const client = new ThirdwebSDK(ScrollSepoliaTestnet, { secretKey: process.env.SECRET_KEY });
        const contract = await client.getContractFromAbi(process.env.CONTRACT_ADDRESS!, ABI.abi)
        return await contract.call("hasSubscriptionOrDocumentsToMint", [publicKey])
    } catch (err) {
        return false
    }
}
const router = express.Router();

router.get("/status", (req, res) => {
    return res.json({ message: "OK" });
})

router.post("/document/share/keys/create", async (req, res) => {
    try {
        const { senderEncryptionKey, senderAesKey, receiverAesKey, documentId, senderPublicKey, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
        if (!senderAesKey) {
            return res.status(400).json({ message: "Missing senderAesKey" });
        }
        if (!senderEncryptionKey) {
            return res.status(400).json({ message: "Missing senderEncryptionKey" });
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
        const sharedDocument = await createSharedDocument(documentId, receiverPublicKey, senderPublicKey, senderAesKey, receiverAesKey, senderEncryptionKey)
        return res.json({ message: sharedDocument });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
})


router.post("/me", async (req, res) => {
    try {
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
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
})

router.post("/me/:id", async (req, res) => {
    try {
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
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
})


router.post("/document/share/upload", async (req, res) => {
    try {
        const { content, documentId, sharedDocumentId, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Missing content" });
        }
        if (!documentId) {
            return res.status(400).json({ message: "Missing documentId" });
        }
        if (!sharedDocumentId) {
            return res.status(400).json({ message: "Missing sharedDocumentId" });
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
        const sharedDocument = await retrieveSharedDocument(sharedDocumentId)
        if (!sharedDocument) {
            return res.status(404).json({ message: "Shared Document not found" });
        }
        await uploadSharedDocument(sharedDocumentId, documentId, content)
        return res.json({ message: sharedDocument });
    }
    catch (e: any) {
        return res.status(400).json({ message: e.message });
    }

})

router.post("/document/share/:id", async (req, res) => {
    //try {
    const { documentId, receiverPublicKey, receiverSignature, receiverSignatureMessage, senderPublicKey } = req.body;
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
    // if (!receiverSignature) {
    //     return res.status(400).json({ message: "Missing receiverSignature" });
    // }
    // if (!receiverSignatureMessage) {
    //     return res.status(400).json({ message: "Missing receiverSignatureMessage" });
    // }
    // if (!senderPublicKey) {
    //     return res.status(400).json({ message: "Missing senderPublicKey" });
    // }
    // const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)

    // if (!isValidSignature) {
    //     return res.status(400).json({ message: "Invalid signature" });
    // }
    const user = await getUserByPublicKey(receiverPublicKey);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const baseSecretKey = user.secretKey;
    const document = await getDocumentById(documentId);

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    const sharedDocument = await retrieveSharedDocument(id)
    if (!sharedDocument) {
        return res.status(404).json({ message: "Shared Document not found" });
    }

    return res.json({ message: { sharedDocument, document, baseSecretKey } });
    // } catch (error: any) {
    //     return res.status(400).json({ message: error.message });
    // }
})

router.post("/document/shares", async (req, res) => {
    try {
        const { receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
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
        if (!isValidSignature) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        const sharedDocuments = await getSharedDocuments(receiverPublicKey)
        return res.json({ message: { sharedDocuments } });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
})

router.post("/document/append", async (req, res) => {

    try {
        const { documentId, proofOfWork, document, receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
        let { documentTitle } = req.body;

        const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
        if (!receiverPublicKey) {
            return res.status(400).json({ message: "Missing receiverPublicKey" });
        }
        if (!documentId) {
            return res.status(400).json({ message: "Missing documentId" });
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
        const hasDocument = await getDocumentByIdAndPublicKey(documentId, receiverPublicKey)
        if (!hasDocument) {
            return res.status(400).json({ message: "Document not found!" })
        }
        const documentRecord = await appendDocument(documentId, document, proofOfWork, documentTitle, receiverPublicKey)
        return res.json({ message: documentRecord });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

router.post("/document/create", async (req, res) => {
    try {
        const { receiverPublicKey, receiverSignature, receiverSignatureMessage } = req.body;
        let { documentTitle } = req.body;
        const isValidSignature = await verifySignature(receiverPublicKey, receiverSignatureMessage, receiverSignature)
        if (!receiverPublicKey) {
            return res.status(400).json({ message: "Missing receiverPublicKey" });
        }
        if (!documentTitle) {
            documentTitle = "Untitled"
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
        const subscription = await hasSubscription(receiverPublicKey)
        if (!subscription) {
            return res.status(400).json({ message: "User does not have a subscription" });
        }
        const documentRecord = await createDocument(receiverPublicKey, documentTitle)
        return res.json({ message: documentRecord });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

router.get("/document/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Missing id" });
        }

        const document = await getDocumentById(id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        const receiverPublicKey = document.receiverPublicKey;
        if (!receiverPublicKey) {
            return res.status(400).json({ message: "Document does not have a receiverPublicKey" });
        }
        const user = await getUserByPublicKey(receiverPublicKey!);
        if (!user) {
            return res.json({ document, receiverPublicKey, secretKey: null });
        }
        const secretKey = user.secretKey
        return res.json({ document, receiverPublicKey, secretKey });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

router.post("/documents", async (req, res) => {
    try {
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
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});




export default router;