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

test('embedding service does not return fabricated vectors without Mistral access', async () => {
  const previousApiKey = env.mistralApiKey;
  env.mistralApiKey = '';

  try {
    await assert.rejects(
      new EmbeddingService().generateEmbedding('resume search'),
      /MISTRAL_API_KEY is not configured/,
    );
  } finally {
    env.mistralApiKey = previousApiKey;
  }
});

test('embedding service rejects vectors with unexpected dimensions', async () => {
  const previousApiKey = env.mistralApiKey;
  const previousFetch = globalThis.fetch;
  env.mistralApiKey = 'test-key';
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: [{ embedding: [0.1, 0.2, 0.3] }],
  }), { status: 200 });

  try {
    await assert.rejects(
      new EmbeddingService().generateEmbedding('resume search'),
      /dimensions did not match EMBEDDING_DIM/,
    );
  } finally {
    env.mistralApiKey = previousApiKey;
    globalThis.fetch = previousFetch;
  }
});

test('embedding service retries rate limits when the provider supplies Retry-After', async () => {
  const previousApiKey = env.mistralApiKey;
  const previousFetch = globalThis.fetch;
  let requestCount = 0;
  env.mistralApiKey = 'test-key';
  globalThis.fetch = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return new Response('', {
        status: 429,
        headers: { 'Retry-After': '0' },
      });
    }
    return new Response(
      JSON.stringify({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      }),
      { status: 200 },
    );
  };

  try {
    const result = await new EmbeddingService().generateEmbedding('resume search');
    assert.equal(requestCount, 2);
    assert.equal(result.dimensions, 1024);
  } finally {
    env.mistralApiKey = previousApiKey;
    globalThis.fetch = previousFetch;
  }
});
