import * as dns from 'node:dns';
import { Collection, Db, MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';
import { env } from '../config/environment';

// Must run before any MongoClient is created.
dns.setServers?.(['8.8.8.8', '8.8.4.4']);

export function normalizeMongoUri(uri: string): string {
  const trimmed = uri?.trim() ?? '';
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('mongodb+srv://') || trimmed.startsWith('mongodb://')) {
    return trimmed;
  }

  return `mongodb://${trimmed}`;
}

export function isMongoConfigured(uri: string = env.mongoUri, databaseName: string = env.mongoDbName, collectionName: string = env.mongoCollectionName): boolean {
  const normalizedUri = normalizeMongoUri(uri);
  return Boolean(normalizedUri && databaseName?.trim() && collectionName?.trim());
}

export function getMongoConnectionOptions(uri: string): MongoClientOptions {
  const isSrvUri = uri.startsWith('mongodb+srv://');

  return {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false,
    },
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    retryWrites: false,
    family: 4,
    maxPoolSize: 5,
    tls: isSrvUri,
    directConnection: false,
  };
}

class MongoConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectAttempted = false;
  private connectError: string | null = null;

  private getResolvedConfig() {
    return {
      uri: normalizeMongoUri(env.mongoUri),
      databaseName: env.mongoDbName.trim(),
      collectionName: env.mongoCollectionName.trim(),
      bm25Index: env.mongoBm25Index.trim(),
      vectorIndex: env.mongoVectorIndex.trim(),
    };
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    if (this.connectAttempted && this.connectError) {
      throw new Error(this.connectError);
    }

    const { uri: normalizedUri, databaseName, collectionName } = this.getResolvedConfig();

    if (!databaseName) {
      throw new Error('MONGODB_DB_NAME is not configured. Set it in your environment or .env file.');
    }

    if (!collectionName) {
      throw new Error('MONGODB_COLLECTION_NAME is not configured. Set it in your environment or .env file.');
    }

    if (!normalizedUri) {
      throw new Error('MONGODB_URI is not configured. Set it in your environment or .env file.');
    }

    const options = getMongoConnectionOptions(normalizedUri);
    const client = new MongoClient(normalizedUri, options as any);

    try {
      console.log('Connecting to:', normalizedUri.replace(/\/\/.*@/, '//****@'));

      await client.connect();

      console.log('MongoDB connected successfully.');
      this.client = client;
      this.db = client.db(databaseName);
      this.connectAttempted = true;
      this.connectError = null;
      return this.db;
    } catch (error) {
      this.client = null;
      this.db = null;
      this.connectAttempted = true;
      this.connectError = this.formatError(error);
      await client.close().catch(() => undefined);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`MongoDB unavailable for ${databaseName}: ${message}`);
    }
  }

  async getCollection(collectionName: string = env.mongoCollectionName): Promise<Collection> {
    const db = await this.connect();
    const resolvedCollectionName = collectionName || env.mongoCollectionName.trim();

    if (!resolvedCollectionName) {
      throw new Error('MONGODB_COLLECTION_NAME is not configured. Set it in your environment or .env file.');
    }

    return db.collection(resolvedCollectionName);
  }

  getCollectionName(): string {
    return this.getResolvedConfig().collectionName;
  }

  getBm25IndexName(): string {
    return this.getResolvedConfig().bm25Index;
  }

  getVectorIndexName(): string {
    return this.getResolvedConfig().vectorIndex;
  }

  async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    try {
      const db = await this.connect();
      const startedAt = Date.now();
      await db.command({ ping: 1 });
      return { ok: true, latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { ok: false, latencyMs: 0, error: this.formatError(error) };
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
    this.connectAttempted = false;
    this.connectError = null;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}

export const mongoConnection = new MongoConnection();
