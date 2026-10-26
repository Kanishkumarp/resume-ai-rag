import test from 'node:test';
import assert from 'node:assert/strict';
import { EmbeddingService } from './embeddingService';
import { env } from '../config/environment';

test('embedding service requires a real Mistral key instead of returning a fabricated vector', async () => {
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
