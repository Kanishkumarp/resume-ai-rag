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

test('errorHandler does not expose internal error messages', () => {
  const res = new MockResponse() as any;
  const req = { get: () => 'req-2' } as any;
  const originalError = console.error;
  const logged: string[] = [];
  console.error = (entry?: unknown) => logged.push(String(entry));

  try {
    errorHandler(new Error('database connection contains private credentials'), req, res, () => undefined);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
      error: 'internal_server_error',
      message: 'An unexpected error occurred.',
      statusCode: 500,
      requestId: 'req-2',
    });
    assert.equal(JSON.stringify(res.body).includes('private credentials'), false);
    assert.equal(logged.length, 1);
    assert.equal(logged[0]?.includes('private credentials'), false);
  } finally {
    console.error = originalError;
  }
});
