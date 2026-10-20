import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../config/environment';
import { EmbeddingService } from './embeddingService';

test('embedding service respects the configured embedding size from environment', async () => {
  const previousApiKey = env.mistralApiKey;
  const previousFetch = globalThis.fetch;

  env.mistralApiKey = 'test-embedding-api-key-not-a-real-secret';
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: [{ embedding: Array.from({ length: 1024 }, (_, index) => index / 1024) }],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const service = new EmbeddingService();
    const result = await service.generateEmbedding('resume search');

    assert.equal(result.dimensions, 1024);
    assert.ok(Array.isArray(result.embedding));
    assert.ok(result.embedding.length > 0);
  } finally {
    env.mistralApiKey = previousApiKey;
    globalThis.fetch = previousFetch;
  }
});
