import test from 'node:test';
import assert from 'node:assert/strict';
import { EmbeddingService } from './embeddingService';

test('embedding service respects the configured embedding size from environment', async () => {
  const service = new EmbeddingService();
  const result = await service.generateEmbedding('resume search');

  assert.equal(result.dimensions, 1024);
  assert.ok(Array.isArray(result.embedding));
  assert.ok(result.embedding.length > 0);
});
