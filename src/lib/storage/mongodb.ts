import { MongoClient, Db } from "mongodb";

/**
 * MongoDB Atlas integration for Hakkiri Studio.
 * Provides resilient cloud persistence across Vercel Lambdas and multi-user scaling.
 */

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

export function isMongoConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(dbName = "hakkiri_studio"): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}

/**
 * Persist JSON data asynchronously to MongoDB collection.
 */
export async function saveToMongo(collectionName: string, docId: string, data: unknown): Promise<void> {
  if (!isMongoConfigured()) return;
  try {
    const db = await getMongoDb();
    if (!db) return;
    const col = db.collection(collectionName);
    await col.replaceOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: docId as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: docId as any, data, updatedAt: new Date() },
      { upsert: true },
    );
  } catch (err) {
    console.warn(`[mongodb] save error for ${collectionName}/${docId}:`, err instanceof Error ? err.message : err);
  }
}

/**
 * Read JSON data from MongoDB collection.
 */
export async function loadFromMongo<T>(collectionName: string, docId: string): Promise<T | null> {
  if (!isMongoConfigured()) return null;
  try {
    const db = await getMongoDb();
    if (!db) return null;
    const col = db.collection(collectionName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await col.findOne({ _id: docId as any });
    if (doc && "data" in doc) {
      return doc.data as T;
    }
    return null;
  } catch (err) {
    console.warn(`[mongodb] load error for ${collectionName}/${docId}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Health check to verify connection to MongoDB Atlas.
 */
export async function testMongoConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isMongoConfigured()) {
    return { ok: false, message: "MONGODB_URI is not set." };
  }
  try {
    const client = await getMongoClient();
    if (!client) return { ok: false, message: "Could not create Mongo client." };
    await client.db("admin").command({ ping: 1 });
    return { ok: true, message: "Connected to MongoDB Atlas successfully!" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}
