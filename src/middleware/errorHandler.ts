import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '../types/common';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = req.get('x-request-id');
  const status = typeof err === 'object' && err !== null && 'status' in err ? Number((err as { status?: number }).status) : undefined;
  const isBadRequest = err instanceof SyntaxError && 'status' in err && (err as SyntaxError & { status?: number }).status === 400;
  const isPayloadTooLarge = status === 413 || (typeof err === 'object' && err !== null && 'type' in err && (err as { type?: string }).type === 'entity.too.large');
  const isExplicitBadRequest = status === 400;
  const statusCode = isPayloadTooLarge ? 413 : isBadRequest || isExplicitBadRequest ? 400 : 500;
  const errorCode = isPayloadTooLarge ? 'payload_too_large' : isBadRequest ? 'invalid_json' : isExplicitBadRequest ? 'invalid_request' : 'internal_server_error';

  const message = typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
    ? (err as { message: string }).message
    : 'Unexpected error';

  const response: ErrorResponse = {
    error: errorCode,
    message,
    statusCode,
    requestId: requestId ?? undefined,
  };

  res.status(statusCode).json(response);
};
