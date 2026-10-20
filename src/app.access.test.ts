import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from './app';
import { env } from './config/environment';

test('sensitive APIs reject unauthenticated requests', async () => {
  const previousToken = env.apiAccessToken;
  env.apiAccessToken = 'test-access-token-for-security-tests-123456';
  const server = createApp().listen(0);

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const routes: Array<{ method: 'GET' | 'POST'; path: string }> = [
      { method: 'POST', path: '/v1/search/hybrid' },
      { method: 'GET', path: '/v1/search/candidate-1' },
      { method: 'GET', path: '/v1/candidate/candidate-1' },
      { method: 'POST', path: '/v1/resume/inject' },
      { method: 'POST', path: '/v1/embeddings' },
    ];

    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route.path}`, { method: route.method });
      assert.equal(response.status, 401, `${route.method} ${route.path} should require authentication`);
    }
  } finally {
    env.apiAccessToken = previousToken;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
