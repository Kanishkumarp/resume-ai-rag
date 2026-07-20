import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeIngestionRepository } from './resumeIngestionRepository';

test('save uses the configured Mongo collection name', async () => {
  const repository = new ResumeIngestionRepository();
  const collectionName = process.env.MONGODB_COLLECTION_NAME || 'resume';

  assert.ok(collectionName, 'Expected a configured Mongo collection name');
  assert.doesNotThrow(() => repository.save({
    fileName: 'test.pdf',
    rawText: 'test',
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
  } as any));
});
