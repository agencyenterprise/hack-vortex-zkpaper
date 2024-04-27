import { ObjectId } from "mongodb";
import { connectToDatabase } from "./database/mongodb";

interface AppendDocumentModel {
    _id?: ObjectId;
    content: string;
    documentTitle?: string;
    proofOfWork: string;
    receiverPublicKey?: string;

}

interface DocumentModel {
    _id?: ObjectId;
    createdAt: Date;
    documentTitle?: string;
    receiverPublicKey: string;

}



interface UserModel {
    _id?: ObjectId;
    publicKey: string;
    secretKey: string;
    createdAt: Date;
}

interface SharedDocumentModel {
    _id?: ObjectId;
    documentId: ObjectId;
    receiverId: ObjectId;
    senderId: ObjectId;
    senderSecretKey: string;
    receiverSecretKey: string;
    receiverPublicKey: string;
    senderPublicKey: string;
    title?: string;
    content?: string;
    createdAt: Date;
}
interface UploadSharedDocumentModel {
    _id?: ObjectId;
    documentId?: ObjectId;
    receiverId?: ObjectId;
    senderId?: ObjectId;
    senderSecretKey?: string;
    receiverSecretKey?: string;
    receiverPublicKey?: string;
    senderPublicKey?: string;
    title?: string;
    content: string;
    createdAt?: Date;
}

export const createSharedDocument = async (documentId: string, receiverPublicKey: string, senderPublicKey: string, senderAesKey: string, receiverAesKey: string) => {

    const { db } = await connectToDatabase();

    const collection = db.collection("users");
    receiverPublicKey = receiverPublicKey.toLowerCase()
    senderPublicKey = senderPublicKey.toLowerCase()
    const users = await collection.find({ publicKey: { $in: [receiverPublicKey, senderPublicKey] } }).toArray();

    const sender = users.find(user => user.publicKey === senderPublicKey);
    const receiver = users.find(user => user.publicKey === receiverPublicKey);

    if (!sender || !receiver) {
        throw new Error("User not found");
    }

    const collectionDocuments = db.collection("documents");

    const document = await collectionDocuments.findOne({ _id: new ObjectId(documentId) });

    if (!document) {
        throw new Error("Document not found");
    }

    const collectionSharedDocuments = db.collection<SharedDocumentModel>("sharedDocuments");

    return collectionSharedDocuments.insertOne({
        documentId: new ObjectId(documentId),
        receiverId: receiver._id,
        senderId: sender._id,
        senderSecretKey: senderAesKey,
        receiverSecretKey: receiverAesKey,
        senderPublicKey,
        receiverPublicKey,
        createdAt: new Date()
    });

}

export const retrieveSharedDocument = async (sharedDocumentId: string, receiverPublicKey: string, senderPublicKey: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<SharedDocumentModel>("sharedDocuments");
    receiverPublicKey = receiverPublicKey.toLowerCase()
    senderPublicKey = senderPublicKey.toLowerCase()
    const sharedDocument = await collection.findOne({ _id: new ObjectId(sharedDocumentId) });

    if (!sharedDocument) {
        throw new Error("Shared Document not found");
    }
    const hasReceiverPublicKey = sharedDocument.receiverPublicKey !== receiverPublicKey
    const hasSenderPublicKey = sharedDocument.senderPublicKey !== senderPublicKey
    if (!hasReceiverPublicKey && !hasSenderPublicKey) {
        throw new Error("User not authorized to view this document");
    }

    return sharedDocument;
}


export const getSharedDocuments = async (receiverPublicKey: string, senderPublicKey: string) => {
    const { db } = await connectToDatabase();
    receiverPublicKey = receiverPublicKey.toLowerCase()
    senderPublicKey = senderPublicKey.toLowerCase()
    const collection = db.collection<SharedDocumentModel>("sharedDocuments");

    const sharedDocuments = await collection.find({ receiverPublicKey, senderPublicKey });
    const documents = await sharedDocuments.toArray();
    if (!documents.length) {
        throw new Error("Shared s not found");
    }
    return sharedDocuments;
}

export const uploadSharedDocument = async (sharedDocumentId: string, content: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<UploadSharedDocumentModel>("sharedDocuments");

    return collection.updateOne({ _id: new ObjectId(sharedDocumentId) }, { $set: { content } });
}

export const appendDocument = async (documentId: string, documentContent: string, proofOfWork: string, documentTitle: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<AppendDocumentModel>("documents");

    return collection.updateOne({ _id: new ObjectId(documentId) }, { $set: { content: documentContent, proofOfWork, documentTitle } });
}

export const createDocument = async (receiverPublicKey: string, documentTitle: string = "Untitled") => {
    const { db } = await connectToDatabase();
    receiverPublicKey = receiverPublicKey.toLowerCase()
    const collection = db.collection<DocumentModel>("documents");

    return collection.insertOne({ createdAt: new Date(), documentTitle, receiverPublicKey: receiverPublicKey.toLowerCase() });
}

export const getDocumentById = async (documentId: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<AppendDocumentModel>("documents");

    return collection.findOne({ _id: new ObjectId(documentId) });
}

export const getUserById = async (userId: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<UserModel>("users");

    return collection.findOne({ _id: new ObjectId(userId) });
}
export const getUserByPublicKey = async (publicKey: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<UserModel>("users");
    return collection.findOne({ publicKey: publicKey.toLowerCase() });
}
export const createUser = async (publicKey: string, secretKey: string) => {
    const { db } = await connectToDatabase();
    publicKey = publicKey.toLowerCase()
    const collection = db.collection<UserModel>("users");

    return await collection.insertOne({ publicKey, secretKey, createdAt: new Date() });
}
export const getUserDocuments = async (publicKey: string, limit: number = 10, skip: number = 0) => {
    if (!limit || limit < 0) {
        limit = 10
    }
    if (limit > 20) {
        limit = 20
    }
    if (!skip || skip < 0) {
        skip = 0
    }
    const { db } = await connectToDatabase();
    publicKey = publicKey.toLowerCase()
    const collection = db.collection<AppendDocumentModel>("documents");

    return await collection.find({ publicKey }, { limit, skip }).toArray();
}