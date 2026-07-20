import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePresetMode } from './use-hybrid-weights';

test('preset selection switches to the matching search mode', () => {
  assert.equal(resolvePresetMode('balanced', 'hybrid'), 'hybrid');
  assert.equal(resolvePresetMode('bm25', 'hybrid'), 'bm25');
  assert.equal(resolvePresetMode('vector', 'hybrid'), 'vector');
});
