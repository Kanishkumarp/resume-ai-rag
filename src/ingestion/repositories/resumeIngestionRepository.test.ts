import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeIngestionRepository } from './resumeIngestionRepository';
import { mongoConnection } from '../../repositories/mongo';
import type { ResumeIngestionDocument } from '../types';

test('save uses the configured Mongo collection name without writing to a live database', async () => {
  const repository = new ResumeIngestionRepository();
  const collectionName = process.env.MONGODB_COLLECTION_NAME || 'resume';
  const originalGetCollection = mongoConnection.getCollection;
  let requestedCollectionName: string | undefined;

  assert.ok(collectionName, 'Expected a configured Mongo collection name');

  try {
    (mongoConnection as typeof mongoConnection & { getCollection: typeof mongoConnection.getCollection }).getCollection = async (name) => {
      requestedCollectionName = name;
      return {
        createIndex: async () => 'resume_dedupe_key_unique',
        findOne: async () => null,
        insertOne: async () => ({
          insertedId: { toString: () => 'test-content-hash' },
        }),
      } as never;
    };

    const saved = await repository.save({
      fileName: 'test.pdf',
      rawText: 'test',
      text: 'test',
      contentHash: 'test-content-hash',
      name: 'Test',
      email: 'test@example.com',
      phone: '123',
      location: 'Test',
      skills: [],
      company: 'Test',
      role: 'Test',
      education: 'Test',
      embedding: [],
      embeddingModel: 'test',
      embeddingDimension: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies ResumeIngestionDocument);

    assert.deepEqual(saved, { id: 'test-content-hash', duplicate: false });
    assert.equal(requestedCollectionName, collectionName);
  } finally {
    (mongoConnection as typeof mongoConnection & { getCollection: typeof mongoConnection.getCollection }).getCollection = originalGetCollection;
  }
});
