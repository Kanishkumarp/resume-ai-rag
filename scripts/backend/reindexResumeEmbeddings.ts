import { env } from '../../src/config/environment';
import { mongoConnection } from '../../src/repositories/mongo';
import { EmbeddingService } from '../../src/services/embeddingService';
import { cleanResumeText } from '../../src/ingestion/utils/textCleaner';
import { createResumeContentHash } from '../../src/ingestion/utils/resumeContentHash';
import { createResumeProfileHashes } from '../../src/ingestion/utils/resumeProfileHashes';

const embeddingService = new EmbeddingService();
const hashOnly = process.argv.includes('--hash-only');
const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string').join(', ');
  }
  return '';
};

const main = async (): Promise<void> => {
  const collection = await mongoConnection.getCollection(env.mongoCollectionName);
  const cursor = collection.find(
    {},
    {
      projection: {
        _id: 1,
        text: 1,
        rawText: 1,
        name: 1,
        role: 1,
        company: 1,
        skills: 1,
        embeddingVersion: 1,
        embeddingModel: 1,
        embeddingDimension: 1,
        contentHash: 1,
        profileHashes: 1,
        email: 1,
        phone: 1,
      },
    },
  );
  let indexed = 0;
  let skipped = 0;
  let hashesBackfilled = 0;
  let scanned = 0;
  const contentHashCounts = new Map<string, number>();
  const profileHashCounts = new Map<string, number>();

  try {
    for await (const document of cursor) {
      scanned += 1;
      const text = cleanResumeText(
        toText(document.text) || toText(document.rawText),
      );
      if (!text) {
        skipped += 1;
        continue;
      }
      const contentHash = createResumeContentHash(text);
      const profileHashes = createResumeProfileHashes(
        document.email,
        document.phone,
        document.name,
        document.role,
        document.company,
      );
      const primaryProfileHash = profileHashes[0];
      if (primaryProfileHash) {
        profileHashCounts.set(
          primaryProfileHash,
          (profileHashCounts.get(primaryProfileHash) ?? 0) + 1,
        );
      }
      contentHashCounts.set(
        contentHash,
        (contentHashCounts.get(contentHash) ?? 0) + 1,
      );
      if (hashOnly) {
        if (
          document.contentHash !== contentHash ||
          JSON.stringify(document.profileHashes ?? []) !==
            JSON.stringify(profileHashes)
        ) {
          await collection.updateOne(
            { _id: document._id },
            {
              $set: {
                contentHash,
                profileHashes,
                updatedAt: new Date().toISOString(),
              },
            },
          );
          hashesBackfilled += 1;
        }
        continue;
      }

      const embeddingIsCurrent =
        document.embeddingVersion === 1 &&
        document.embeddingModel === env.mistralEmbeddingModel &&
        Number(document.embeddingDimension) === env.embeddingDim;
      if (embeddingIsCurrent) {
        if (
          document.contentHash !== contentHash ||
          JSON.stringify(document.profileHashes ?? []) !==
            JSON.stringify(profileHashes)
        ) {
          await collection.updateOne(
            { _id: document._id },
            {
              $set: {
                contentHash,
                profileHashes,
                updatedAt: new Date().toISOString(),
              },
            },
          );
          hashesBackfilled += 1;
        }
        continue;
      }

      const input = [
        toText(document.name),
        toText(document.role),
        toText(document.skills),
        toText(document.company),
        text.slice(0, 20_000),
      ]
        .filter(Boolean)
        .join('\n');

      if (!input) {
        skipped += 1;
        continue;
      }

      if (!env.mistralApiKey) {
        throw new Error('MISTRAL_API_KEY is required to reindex resume embeddings.');
      }
      const result = await embeddingService.generateEmbedding(input);
      await collection.updateOne(
        { _id: document._id },
        {
          $set: {
            text,
            embedding: result.embedding,
            embeddingModel: result.model,
            embeddingDimension: result.dimensions,
            embeddingVersion: 1,
            contentHash,
            profileHashes,
            updatedAt: new Date().toISOString(),
          },
        },
      );
      indexed += 1;
    }
  } finally {
    await cursor.close();
  }

  const duplicateGroups = Array.from(contentHashCounts.values()).filter(
    (count) => count > 1,
  ).length;
  const duplicateCopies = Array.from(contentHashCounts.values()).reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );
  const profileDuplicateGroups = Array.from(profileHashCounts.values()).filter(
    (count) => count > 1,
  ).length;
  const profileDuplicateCopies = Array.from(profileHashCounts.values()).reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );
  console.log(
    `${hashOnly ? `Backfilled identity hashes for ${hashesBackfilled} resumes` : `Reindexed ${indexed} resumes; backfilled ${hashesBackfilled} identity hashes`}; scanned ${scanned}, skipped ${skipped} empty documents, and found ${duplicateCopies} exact-content copies across ${duplicateGroups} hashes plus ${profileDuplicateCopies} profile-key matches across ${profileDuplicateGroups} keys (not deleted).`,
  );
};

void main()
  .catch((error: unknown) => {
    console.error(
      'Resume embedding reindex failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoConnection.close();
  });
