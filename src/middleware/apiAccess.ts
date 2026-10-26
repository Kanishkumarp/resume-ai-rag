import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import { env } from '../config/environment';
import { apiAccessRepository, type ApiAccessRepository } from '../repositories/apiAccessRepository';

const SESSION_COOKIE = 'resume_session';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

const sendUnauthorized = (res: Response): void => {
  res.status(401).json({
    error: 'unauthorized',
    message: 'A valid session is required.',
    statusCode: 401,
  });
};

const hashValue = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const readSessionCookie = (req: Request): string | null => {
  const cookieHeader = req.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) =>
    part.startsWith(`${SESSION_COOKIE}=`),
  );
  const value = cookie?.slice(SESSION_COOKIE.length + 1);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
};

const tokensMatch = (receivedToken: unknown, expectedToken: string): receivedToken is string => {
  if (typeof receivedToken !== 'string') {
    return false;
  }

  const received = Buffer.from(receivedToken.trim());
  const expected = Buffer.from(expectedToken);
  return received.length === expected.length && timingSafeEqual(received, expected);
};

export const createApiAccessHandlers = (repository: ApiAccessRepository) => {
  const requireApiAccessToken: RequestHandler = async (req, res, next) => {
    try {
      const session = readSessionCookie(req);
      if (!session || !await repository.hasActiveSession(hashValue(session), new Date())) {
        res.clearCookie(SESSION_COOKIE, { path: '/v1' });
        sendUnauthorized(res);
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  const createSession: RequestHandler = async (req, res, next) => {
    try {
      const existingSession = readSessionCookie(req);
      if (existingSession && await repository.hasActiveSession(hashValue(existingSession), new Date())) {
        res.status(204).end();
        return;
      }

      const expectedToken = env.apiAccessToken;
      if (Buffer.byteLength(expectedToken) < 32) {
        res.status(503).json({
          error: 'service_unavailable',
          message: 'API access is not configured.',
          statusCode: 503,
        });
        return;
      }

      if (!tokensMatch(req.body?.accessToken, expectedToken)) {
        sendUnauthorized(res);
        return;
      }

      const session = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      const consumed = await repository.consumeAccessToken(
        hashValue(expectedToken),
        hashValue(session),
        expiresAt,
      );

      if (!consumed) {
        res.status(401).json({
          error: 'unauthorized',
          message: 'This access token has already been used. Configure a new API_ACCESS_TOKEN.',
          statusCode: 401,
        });
        return;
      }

      res.cookie('resume_session', session, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'strict',
        path: '/v1',
        maxAge: SESSION_DURATION_MS,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  return { createSession, requireApiAccessToken };
};

const apiAccessHandlers = createApiAccessHandlers(apiAccessRepository);

export const createApiSession = apiAccessHandlers.createSession;
export const requireApiAccessToken = apiAccessHandlers.requireApiAccessToken;
