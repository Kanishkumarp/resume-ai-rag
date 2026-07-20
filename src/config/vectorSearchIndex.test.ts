import test from 'node:test';
import assert from 'node:assert/strict';
import { getVectorSearchIndexDefinition } from './vectorSearchIndex';


test('vector search index config uses knnVector mapping with configured dimensions', () => {
  const definition = getVectorSearchIndexDefinition();

  assert.equal(definition.name, 'vector_index');
  assert.equal(definition.definition.mappings.fields.embedding.type, 'knnVector');
  assert.equal(definition.definition.mappings.fields.embedding.similarity, 'cosine');
  assert.ok(definition.definition.mappings.fields.embedding.dimensions > 0);
});
