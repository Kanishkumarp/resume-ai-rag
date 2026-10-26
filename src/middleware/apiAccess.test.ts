import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { env } from '../config/environment';
import { createApiAccessHandlers } from './apiAccess';
import type { ApiAccessRepository } from '../repositories/apiAccessRepository';

const configuredToken = 'test-access-token-for-security-tests-123456';

const makeHarness = (repository: ApiAccessRepository) => {
  const handlers = createApiAccessHandlers(repository);
  const call = async (
    handler: typeof handlers.createSession,
    options: { body?: unknown; cookie?: string } = {},
  ) => {
    let statusCode = 200;
    let body: unknown;
    let sessionCookie: { name: string; value: string; options: unknown } | undefined;
    let clearedCookie: { name: string; options: unknown } | undefined;
    let ended = false;
    let nextError: unknown;
    const req = {
      body: options.body,
      get: (name: string) =>
        name.toLowerCase() === 'cookie' ? options.cookie : undefined,
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
      cookie: (name: string, value: string, cookieOptions: unknown) => {
        sessionCookie = { name, value, options: cookieOptions };
        return res;
      },
      clearCookie: (name: string, cookieOptions: unknown) => {
        clearedCookie = { name, options: cookieOptions };
        return res;
      },
      end: () => {
        ended = true;
        return res;
      },
    } as unknown as Response;

    await handler(req, res, (error?: unknown) => {
      nextError = error;
    });
    return { statusCode, body, sessionCookie, clearedCookie, ended, nextError };
  };

  return { ...handlers, call };
};

test('the configured access token can only bootstrap one durable session', async (t) => {
  const previousToken = env.apiAccessToken;
  env.apiAccessToken = configuredToken;

  try {
    const consumedTokens = new Set<string>();
    const sessions = new Map<string, Date>();
    const repository: ApiAccessRepository = {
      consumeAccessToken: async (tokenHash, sessionHash, expiresAt) => {
        if (consumedTokens.has(tokenHash)) {
          return false;
        }
        consumedTokens.add(tokenHash);
        sessions.set(sessionHash, expiresAt);
        return true;
      },
      hasActiveSession: async (sessionHash, now) => {
        const expiresAt = sessions.get(sessionHash);
        return Boolean(expiresAt && expiresAt > now);
      },
    };
    const { createSession, requireApiAccessToken, call } = makeHarness(repository);

    await t.test('rejects missing and invalid bootstrap credentials', async () => {
      assert.equal((await call(createSession)).statusCode, 401);
      assert.equal((await call(createSession, { body: { accessToken: 'wrong-token' } })).statusCode, 401);
    });

    await t.test('sets a secure session cookie and does not expose the token', async () => {
      const result = await call(createSession, {
        body: { accessToken: configuredToken },
      });
      assert.equal(result.statusCode, 204);
      assert.equal(result.ended, true);
      assert.equal(result.sessionCookie?.name, 'resume_session');
      assert.notEqual(result.sessionCookie?.value, configuredToken);
      assert.deepEqual(result.sessionCookie?.options, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/v1',
        maxAge: 12 * 60 * 60 * 1000,
      });

      const request = await call(requireApiAccessToken, {
        cookie: `resume_session=${result.sessionCookie?.value}`,
      });
      assert.equal(request.nextError, undefined);
      assert.equal(request.statusCode, 200);

      const existingSession = await call(createSession, {
        cookie: `resume_session=${result.sessionCookie?.value}`,
      });
      assert.equal(existingSession.statusCode, 204);
      assert.equal(existingSession.sessionCookie, undefined);
    });

    await t.test('rejects replay even when a new handler instance is created', async () => {
      const result = await makeHarness(repository).call(createSession, {
        body: { accessToken: configuredToken },
      });
      assert.equal(result.statusCode, 401);
      assert.equal(
        (result.body as { message: string }).message,
        'This access token has already been used. Configure a new API_ACCESS_TOKEN.',
      );
    });

    await t.test('rejects missing sessions on protected requests', async () => {
      const result = await call(requireApiAccessToken);
      assert.equal(result.statusCode, 401);
      assert.deepEqual(result.clearedCookie, {
        name: 'resume_session',
        options: { path: '/v1' },
      });
    });
  } finally {
    env.apiAccessToken = previousToken;
  }
});
