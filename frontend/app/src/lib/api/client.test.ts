import test from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError, type AxiosResponse } from 'axios';
import apiClient from './client';
import { resetApiSession, sessionClient } from './session';

const unauthorizedError = (config: Parameters<NonNullable<typeof sessionClient.defaults.adapter>>[0]) => {
  const response: AxiosResponse = {
    data: { message: 'Unauthorized.' },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  };
  return new AxiosError(
    'Unauthorized',
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    response,
  );
};

test('protected API calls exchange the one-time credential for a session cookie', async () => {
  const originalApiAdapter = apiClient.defaults.adapter;
  const originalSessionAdapter = sessionClient.defaults.adapter;
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const promptMessages: string[] = [];
  const sessionRequests: Array<{ url?: string; data?: unknown }> = [];
  const requestHeaders: Array<Record<string, unknown>> = [];
  let sessionChecks = 0;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      prompt: (message: string) => {
        promptMessages.push(message);
        return 'one-time-token-for-test';
      },
    },
  });

  sessionClient.defaults.adapter = async (config) => {
    sessionRequests.push({ url: config.url, data: config.data });
    sessionChecks += 1;
    if (sessionChecks === 1) {
      throw unauthorizedError(config);
    }
    return {
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config,
    };
  };

  apiClient.defaults.adapter = async (config) => {
    requestHeaders.push(config.headers as unknown as Record<string, unknown>);
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };

  resetApiSession();
  try {
    const response = await apiClient.get('/v1/search/hybrid');

    assert.equal(response.status, 200);
    assert.equal(promptMessages.length, 1);
    assert.match(String(sessionRequests[0]?.url), /\/v1\/auth\/session$/);
    assert.equal(sessionRequests[0]?.data, undefined);
    assert.deepEqual(JSON.parse(String(sessionRequests[1]?.data)), {
      accessToken: 'one-time-token-for-test',
    });
    assert.equal(requestHeaders[0]?.Authorization, undefined);
    assert.equal(apiClient.defaults.withCredentials, true);
  } finally {
    resetApiSession();
    apiClient.defaults.adapter = originalApiAdapter;
    sessionClient.defaults.adapter = originalSessionAdapter;
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  }
});
