import { env } from '../../config/environment';
import { mongoConnection } from '../../repositories/mongo';
import { ResumeIngestionDocument } from '../types';

export class ResumeIngestionRepository {
  private contentHashIndex?: Promise<void>;

  async findByContentHash(
    contentHash: string,
    profileHashes: string[] = [],
  ): Promise<string | null> {
    const collectionName = env.mongoCollectionName || 'resume';
    const collection = await mongoConnection.getCollection(collectionName);
    this.contentHashIndex ??= Promise.all([
      collection.createIndex(
        { contentHash: 1 },
        { name: 'resume_content_hash_idx' },
      ),
      collection.createIndex(
        { profileHashes: 1 },
        { name: 'resume_profile_hashes_idx' },
      ),
      collection.createIndex(
        { dedupeKey: 1 },
        {
          name: 'resume_dedupe_key_unique',
          unique: true,
          partialFilterExpression: { dedupeKey: { $type: 'string' } },
        },
      ),
    ]).then(() => undefined);
    await this.contentHashIndex;
    const profileQuery =
      profileHashes.length > 0
        ? [{ profileHashes: { $in: profileHashes } }]
        : [];
    const existing = await collection.findOne(
      {
        $or: [
          { contentHash },
          { dedupeKey: contentHash },
          ...profileQuery,
        ],
      },
      { projection: { _id: 1 } },
    );
    return existing?._id?.toString() ?? null;
  }

  async save(
    document: ResumeIngestionDocument,
  ): Promise<{ id: string; duplicate: boolean }> {
    const collectionName = env.mongoCollectionName || 'resume';
    const collection = await mongoConnection.getCollection(collectionName);
    try {
      const result = await collection.insertOne({
        ...document,
        dedupeKey: document.profileHashes?.[0] ?? document.contentHash,
      });
      const id = result.insertedId.toString();
      console.log(`[ingestion] inserted resume into collection "${collectionName}" with id ${id}`);
      return { id, duplicate: false };
    } catch (error) {
      if (
        typeof error !== 'object' ||
        error === null ||
        !('code' in error) ||
        error.code !== 11000
      ) {
        throw error;
      }
      const existing = await collection.findOne(
        {
          $or: [
            { contentHash: document.contentHash },
            { dedupeKey: document.profileHashes?.[0] ?? document.contentHash },
            ...(document.profileHashes?.length
              ? [{ profileHashes: { $in: document.profileHashes } }]
              : []),
          ],
        },
        { projection: { _id: 1 } },
      );
      if (!existing?._id) {
        throw error;
      }
      return { id: existing._id.toString(), duplicate: true };
    }
  }
}
