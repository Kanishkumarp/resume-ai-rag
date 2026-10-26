import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowSuggestionChips } from './ChatMain.tsx';

test('suggestion chips appear before any chat messages and disappear once a conversation exists', () => {
  assert.equal(shouldShowSuggestionChips([]), true);
  assert.equal(shouldShowSuggestionChips([{ id: '1', role: 'user', content: 'hello' } as never]), false);
});
