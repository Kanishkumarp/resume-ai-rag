import { test } from 'node:test';
import { requestIdMiddleware } from './requestContext';

const assert = require('node:assert/strict') as typeof import('node:assert/strict');
const crypto = require('crypto') as typeof import('crypto');

class MockResponse {
  headers: Record<string, string> = {};
  locals: Record<string, unknown> = {};

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }
}

test('requestIdMiddleware reuses an existing request id', () => {
  const res = new MockResponse() as any;
  const req = {
    headers: { 'x-request-id': 'req-123' },
    get(name: string) {
      return this.headers[name.toLowerCase()];
    },
  } as any;

  let nextCalled = false;
  requestIdMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.headers['x-request-id'], 'req-123');
  assert.equal(res.headers['x-request-id'], 'req-123');
  assert.equal(res.locals.requestId, 'req-123');
});

test('requestIdMiddleware generates a request id when one is missing', () => {
  const res = new MockResponse() as any;
  const req = {
    headers: {},
    get(name: string) {
      return this.headers[name.toLowerCase()];
    },
  } as any;

  requestIdMiddleware(req, res, () => undefined);

  assert.match(req.headers['x-request-id'], /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(res.headers['x-request-id'], req.headers['x-request-id']);
  assert.equal(res.locals.requestId, req.headers['x-request-id']);
});

test('requestIdMiddleware falls back when randomUUID is unavailable', () => {
  const originalRandomUUID = crypto.randomUUID;
  const res = new MockResponse() as any;
  const req = {
    headers: {},
    get(name: string) {
      return this.headers[name.toLowerCase()];
    },
  } as any;

  (crypto as typeof crypto & { randomUUID?: typeof crypto.randomUUID }).randomUUID = undefined as unknown as typeof crypto.randomUUID;

  try {
    requestIdMiddleware(req, res, () => undefined);

    assert.equal(typeof req.headers['x-request-id'], 'string');
    assert.ok(req.headers['x-request-id'].length > 0);
    assert.equal(res.headers['x-request-id'], req.headers['x-request-id']);
    assert.equal(res.locals.requestId, req.headers['x-request-id']);
  } finally {
    (crypto as typeof crypto & { randomUUID?: typeof crypto.randomUUID }).randomUUID = originalRandomUUID;
  }
});
