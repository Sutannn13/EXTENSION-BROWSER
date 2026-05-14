import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EduOverlayDB extends DBSchema {
  chatMessages: {
    key: string;
    value: {
      id: string;
      domain: string;
      messages: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }[];
      updatedAt: number;
    };
    indexes: { 'by-domain': string };
  };
  fileChunks: {
    key: string;
    value: {
      id: string;
      domain: string;
      filename: string;
      chunks: { id: string; text: string; index: number; wordCount: number }[];
      createdAt: number;
    };
    indexes: { 'by-domain': string };
  };
}

const DB_NAME = 'eduoverlay-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<EduOverlayDB> | null = null;

async function getDB(): Promise<IDBPDatabase<EduOverlayDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<EduOverlayDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('chatMessages')) {
        const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
        chatStore.createIndex('by-domain', 'domain');
      }
      if (!db.objectStoreNames.contains('fileChunks')) {
        const fileStore = db.createObjectStore('fileChunks', { keyPath: 'id' });
        fileStore.createIndex('by-domain', 'domain');
      }
    },
  });

  return dbInstance;
}

export async function saveChatMessages(domain: string, messages: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }[]): Promise<void> {
  const db = await getDB();
  await db.put('chatMessages', { id: `chat-${domain}`, domain, messages, updatedAt: Date.now() });
}

export async function getChatMessages(domain: string): Promise<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }[]> {
  const db = await getDB();
  const record = await db.get('chatMessages', `chat-${domain}`);
  return record?.messages || [];
}

export async function clearChatMessages(domain: string): Promise<void> {
  const db = await getDB();
  await db.delete('chatMessages', `chat-${domain}`);
}