import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { env } from '../config/environment';

const sendUnauthorized = (res: Parameters<RequestHandler>[1]): void => {
  res.status(401).json({
    error: 'unauthorized',
    message: 'A valid bearer token is required.',
    statusCode: 401,
  });
};

export const requireApiAccessToken: RequestHandler = (req, res, next) => {
  const expectedToken = env.apiAccessToken;
  if (Buffer.byteLength(expectedToken) < 32) {
    res.status(503).json({
      error: 'service_unavailable',
      message: 'API access is not configured.',
      statusCode: 503,
    });
    return;
  }

  const match = /^Bearer ([^\s]+)$/i.exec(req.get('authorization') ?? '');
  if (!match) {
    sendUnauthorized(res);
    return;
  }

  const received = Buffer.from(match[1]);
  const expected = Buffer.from(expectedToken);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    sendUnauthorized(res);
    return;
  }

  next();
};
