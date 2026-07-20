import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from './errorHandler';

class MockResponse {
  statusCode = 200;
  body: unknown;

  status(code: number): MockResponse {
    this.statusCode = code;
    return this;
  }

  json(payload: unknown): MockResponse {
    this.body = payload;
    return this;
  }
}

test('errorHandler returns 413 for oversized payload errors', () => {
  const res = new MockResponse() as any;
  const req = { get: () => 'req-1' } as any;

  errorHandler({ status: 413, type: 'entity.too.large', message: 'request entity too large' }, req, res, () => undefined);

  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.body, {
    error: 'payload_too_large',
    message: 'request entity too large',
    statusCode: 413,
    requestId: 'req-1',
  });
});
