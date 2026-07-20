import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

const buildRequestId = (): string => {
  if (typeof randomUUID === 'function') {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const incomingRequestId = req.get(REQUEST_ID_HEADER);
  const requestId = typeof incomingRequestId === 'string' && incomingRequestId.trim().length > 0
    ? incomingRequestId.trim()
    : buildRequestId();

  req.headers[REQUEST_ID_HEADER] = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.locals.requestId = requestId;

  next();
};
