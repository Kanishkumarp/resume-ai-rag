import { NextFunction, Request, Response } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startedAt = Date.now();
  const requestId = req.get('x-request-id') ?? 'unknown';

  res.on('finish', () => {
    const componentTimings = (res.locals as Record<string, unknown>).componentTimings as Record<string, number> | undefined;
    const logEntry = {
      requestId,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      componentTimings: componentTimings ?? {},
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
};
