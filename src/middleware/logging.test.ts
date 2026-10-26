import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import type { Request, Response } from 'express';
import { loggingMiddleware } from './logging';

test('request logs do not contain query-string data', () => {
  const originalLog = console.log;
  const entries: string[] = [];
  const response = new EventEmitter() as Response;
  response.locals = {};
  response.statusCode = 200;

  console.log = (entry?: unknown) => {
    entries.push(String(entry));
  };

  try {
    loggingMiddleware(
      {
        get: () => 'request-id',
        originalUrl: '/v1/search?candidate=private-search-term',
        path: '/v1/search',
        method: 'GET',
      } as unknown as Request,
      response,
      () => undefined,
    );
    response.emit('finish');

    assert.equal(entries.length, 1);
    const loggedEntry = JSON.parse(entries[0] ?? '') as Record<string, unknown>;
    const { durationMs, ...loggedWithoutDuration } = loggedEntry;
    assert.deepEqual(loggedWithoutDuration, {
      requestId: 'request-id',
      endpoint: '/v1/search',
      method: 'GET',
      statusCode: 200,
      componentTimings: {},
    });
    assert.equal(typeof durationMs, 'number');
    assert.equal(entries[0]?.includes('private-search-term'), false);
  } finally {
    console.log = originalLog;
  }
});
