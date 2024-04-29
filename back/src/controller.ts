import { ObjectId } from "mongodb";
import { connectToDatabase } from "./database/mongodb";

interface AppendDocumentModel {
    _id?: ObjectId;
    content: string;
    documentTitle?: string;
    proofOfWork: string;
    receiverPublicKey?: string;

}

interface ReadDocumentModel {
    _id?: ObjectId;
    documentTitle?: string;
    proofOfWork: string;
    receiverPublicKey?: string;
    createdAt: Date;

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
    senderEncryptionKey: string;
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

export const createSharedDocument = async (documentId: string, receiverPublicKey: string, senderPublicKey: string, senderAesKey: string, receiverAesKey: string, senderEncryptionKey: string) => {

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
        senderEncryptionKey,
        receiverPublicKey,
        createdAt: new Date()
    });

}

export const retrieveSharedDocument = async (sharedDocumentId: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<SharedDocumentModel>("sharedDocuments");
    const sharedDocument = await collection.findOne({ _id: new ObjectId(sharedDocumentId) });

    if (!sharedDocument) {
        throw new Error("Shared Document not found");
    }
    return sharedDocument;
}


export const getSharedDocuments = async (receiverPublicKey: string) => {
    const { db } = await connectToDatabase();
    receiverPublicKey = receiverPublicKey.toLowerCase()
    const collection = db.collection<SharedDocumentModel>("sharedDocuments");
    console.log(JSON.stringify([
        {
            $lookup: {
                from: "sharedDocuments",       // collection to join
                localField: "_id",             // field from the input documents
                foreignField: "documentId",    // field from the documents of the "from" collection
                as: "documentsDetails",
                pipeline: [
                    {
                        $match: {
                            receiverPublicKey
                        }
                    }
                ],   // output array field with the joined documents
            }
        }, {
            $match: {
                "sharedDocumentDetails": { $ne: [] }  // Filters out documents without any matching sharedDocuments
            }
        }
    ]))
    const documents = await collection.find({ $or: [{ receiverPublicKey }, { senderPublicKey: receiverPublicKey }] }).toArray();
    return documents;
}

export const uploadSharedDocument = async (sharedDocumentId: string, documentId: string, content: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<UploadSharedDocumentModel>("sharedDocuments");

    return collection.updateOne({ _id: new ObjectId(sharedDocumentId), documentId: new ObjectId(documentId) }, { $set: { content } });
}

export const appendDocument = async (documentId: string, documentContent: string, proofOfWork: string, documentTitle: string, receiverPublicKey: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<AppendDocumentModel>("documents");

    return collection.updateOne({ _id: new ObjectId(documentId), receiverPublicKey }, { $set: { content: documentContent, proofOfWork, documentTitle } });
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


export const getDocumentByIdAndPublicKey = async (documentId: string, receiverPublicKey: string) => {
    const { db } = await connectToDatabase();

    const collection = db.collection<AppendDocumentModel>("documents");

    return collection.findOne({ _id: new ObjectId(documentId), receiverPublicKey });
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
export const getUserDocuments = async (receiverPublicKey: string, limit: number = 100, skip: number = 0) => {
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
    receiverPublicKey = receiverPublicKey.toLowerCase()
    const collection = db.collection<ReadDocumentModel>("documents");

    return await collection.find({ receiverPublicKey }, { limit, skip }).project({ content: 0 }).toArray();
}