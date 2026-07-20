import test from 'node:test';
import assert from 'node:assert/strict';
import { getSampleResumeDocuments } from './sampleResumeData';

test('seed data contains searchable resume documents', () => {
  const documents = getSampleResumeDocuments();

  assert.ok(documents.length > 0, 'Expected sample resumes to be available');
  assert.ok(documents.some((document) => document.text?.includes('Node.js') || document.text?.includes('node.js')));
  assert.ok(documents.some((document) => Array.isArray(document.skills) && document.skills.includes('MongoDB')));
});
