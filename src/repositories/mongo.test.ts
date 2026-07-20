import test from 'node:test';
import assert from 'node:assert/strict';
import { getMongoConnectionOptions, isMongoConfigured, normalizeMongoUri } from './mongo';

test('normalizeMongoUri preserves configured MongoDB connection strings', () => {
  assert.equal(normalizeMongoUri(' mongodb://127.0.0.1:27017 '), 'mongodb://127.0.0.1:27017');
  assert.equal(normalizeMongoUri('mongodb+srv://user:pass@cluster0.example.mongodb.net/?appName=cluster'), 'mongodb+srv://user:pass@cluster0.example.mongodb.net/?appName=cluster');
  assert.equal(normalizeMongoUri('localhost:27017'), 'mongodb://localhost:27017');
});

test('getMongoConnectionOptions enables TLS for SRV URIs only', () => {
  assert.equal(getMongoConnectionOptions('mongodb+srv://user:pass@cluster0.example.mongodb.net/?appName=cluster').tls, true);
  assert.equal(getMongoConnectionOptions('mongodb://127.0.0.1:27017').tls, false);
});

test('getMongoConnectionOptions does not enforce strict Stable API mode', () => {
  const options = getMongoConnectionOptions('mongodb+srv://user:pass@cluster0.example.mongodb.net/?appName=cluster');
  assert.equal((options.serverApi as { strict?: boolean } | undefined)?.strict, false);
});

test('isMongoConfigured only returns true when database settings are fully provided', () => {
  assert.equal(isMongoConfigured('', '', ''), false);
  assert.equal(isMongoConfigured('mongodb://127.0.0.1:27017', 'ragresume', ''), false);
  assert.equal(isMongoConfigured('mongodb://127.0.0.1:27017', 'ragresume', 'resume'), true);
});
