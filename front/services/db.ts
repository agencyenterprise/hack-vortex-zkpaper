// db.js



import Dexie, { Table } from 'dexie';

export interface Document {
    id?: string;
    content: string;
    contentTitle: string
    pubkey: string;
    num_writes: number;
    num_pastes: number;
    externalId: string;
}

export class DocumentDB extends Dexie {
    // 'documents' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    documents!: Table<Document>;

    constructor() {
        super('DocumentDB');
        this.version(1).stores({
            documents: 'id, content, contentTitle, pubkey, num_writes, num_pastes, externalId' // Primary key and indexed props
        });
    }
}

export const db = new DocumentDB();