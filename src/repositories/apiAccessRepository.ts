import { mongoConnection } from './mongo';

const TOKEN_USE_COLLECTION = 'api_access_token_uses';
const SESSION_COLLECTION = 'api_access_sessions';

export interface ApiAccessRepository {
  consumeAccessToken(tokenHash: string, sessionHash: string, expiresAt: Date): Promise<boolean>;
  hasActiveSession(sessionHash: string, now: Date): Promise<boolean>;
}

class MongoApiAccessRepository implements ApiAccessRepository {
  private indexesReady: Promise<void> | null = null;

  async consumeAccessToken(
    tokenHash: string,
    sessionHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const { tokenUses, sessions } = await this.getCollections();
    await sessions.insertOne({ sessionHash, expiresAt, createdAt: new Date() });

    try {
      await tokenUses.insertOne({ tokenHash, consumedAt: new Date() });
      return true;
    } catch (error) {
      await sessions.deleteOne({ sessionHash });
      if (this.isDuplicateKeyError(error)) {
        return false;
      }
      throw error;
    }
  }

  async hasActiveSession(sessionHash: string, now: Date): Promise<boolean> {
    const { sessions } = await this.getCollections();
    return Boolean(await sessions.findOne({ sessionHash, expiresAt: { $gt: now } }));
  }

  private async getCollections() {
    const db = await mongoConnection.connect();
    const tokenUses = db.collection(TOKEN_USE_COLLECTION);
    const sessions = db.collection(SESSION_COLLECTION);

    if (!this.indexesReady) {
      this.indexesReady = Promise.all([
        tokenUses.createIndex({ tokenHash: 1 }, { unique: true }),
        sessions.createIndex({ sessionHash: 1 }, { unique: true }),
        sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]).then(() => undefined);
    }

    try {
      await this.indexesReady;
    } catch (error) {
      this.indexesReady = null;
      throw error;
    }

    return { tokenUses, sessions };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error &&
      (error as { code?: unknown }).code === 11000;
  }
}

export const apiAccessRepository = new MongoApiAccessRepository();
