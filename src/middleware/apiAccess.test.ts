import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { env } from '../config/environment';
import { requireApiAccessToken } from './apiAccess';

const invokeMiddleware = (authorization?: string) => {
  let statusCode = 200;
  let body: unknown;
  let nextCalled = false;
  const req = {
    get: (name: string) => name === 'authorization' ? authorization : undefined,
  } as unknown as Request;
  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (payload: unknown) => {
      body = payload;
      return res;
    },
  } as unknown as Response;

  requireApiAccessToken(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, body, nextCalled };
};

test('API access requires a configured, matching bearer token', async (t) => {
  const previousToken = env.apiAccessToken;
  const testToken = 'test-access-token-for-security-tests-123456';

  try {
    await t.test('fails closed when no token is configured', () => {
      env.apiAccessToken = '';
      const result = invokeMiddleware(`Bearer ${testToken}`);
      assert.equal(result.statusCode, 503);
      assert.equal(result.nextCalled, false);
    });

    await t.test('rejects missing or invalid tokens', () => {
      env.apiAccessToken = testToken;
      assert.equal(invokeMiddleware().statusCode, 401);
      assert.equal(invokeMiddleware('Bearer wrong-access-token-for-security-tests').statusCode, 401);
      assert.equal(invokeMiddleware(testToken).statusCode, 401);
    });

    await t.test('accepts the configured bearer token', () => {
      env.apiAccessToken = testToken;
      const result = invokeMiddleware(`Bearer ${testToken}`);
      assert.equal(result.statusCode, 200);
      assert.equal(result.nextCalled, true);
    });
  } finally {
    env.apiAccessToken = previousToken;
  }
});
