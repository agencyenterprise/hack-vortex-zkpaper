import { ObjectId } from "mongodb";
import { connectToDatabase } from "./database/mongodb";

interface DocumentModel {
    _id: ObjectId;
    content: string;
    createdAt: Date;
}

interface UserModel {
    _id: ObjectId;
    publicKey: string;
    secretKey: string;
    createdAt: Date;
}

interface SharedDocumentModel {
    _id: ObjectId;
    documentId: ObjectId;
    receiverId: ObjectId;
    senderId: ObjectId;
    senderSecretKey: string;
    receiverSecretKey: string;
    title?: string;
    content?: string;
    createdAt: Date;
}

export const createSharedDocument = async (documentId: string, receiverPublicKey: string, senderPublicKey: string, senderAesKey: string, receiverAesKey: string) => {

    const { db } = await connectToDatabase();

    const collection = db.collection("users");

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

    const collectionSharedDocuments = db.collection("sharedDocuments");

    return collectionSharedDocuments.insertOne({
        documentId: new ObjectId(documentId),
        receiverId: receiver._id,
        senderId: sender._id,
        senderSecretKey: senderAesKey,
        receiverSecretKey: receiverAesKey,
        createdAt: new Date()
    });

}

export const uploadSharedDocument = async (sharedDocumentId: string, content: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection("sharedDocuments");

    return collection.updateOne({ _id: new ObjectId(sharedDocumentId) }, { $set: { content } });
}

export const acceptSharedDocument = async (sharedDocumentId: string, receiverPublicKey: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection("users");

    const users = await collection.find({ publicKey: receiverPublicKey }).toArray();

    const receiver = users.find(user => user.publicKey === receiverPublicKey);

    if (!receiver) {
        throw new Error("User not found");
    }
}

export const createDocument = async (documentContent: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection("documents");

    return collection.insertOne({ content: documentContent, createdAt: new Date() });
}

export const getDocumentById = async (documentId: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<DocumentModel>("documents");

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

    return collection.findOne({ publicKey });
}

export const getUserDocuments = async (publicKey: string, limit: number = 10, skip: number = 0) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<DocumentModel>("documents");

    return collection.find({ publicKey }, { limit, skip });
}