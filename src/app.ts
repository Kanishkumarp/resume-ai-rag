import * as express from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import { env } from './config/environment';
import { requestIdMiddleware } from './middleware/requestContext';
import { errorHandler } from './middleware/errorHandler';
import { loggingMiddleware } from './middleware/logging';
import healthRoutes from './routes/healthRoutes';
import embeddingRoutes from './routes/embeddingRoutes';
import searchRoutes from './routes/searchRoutes';
import ingestionRoutes from '../backend/src/ingestion/routes/ingestionRoutes';
import retrievalRoutes from '../backend/src/retrieval/routes/retrievalRoutes';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json({ limit: env.requestMaxBytes, strict: true }));
  app.use(requestIdMiddleware);
  app.use(loggingMiddleware);

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Resume AI RAG API is running' });
  });

  app.use('/v1', healthRoutes);
  app.use('/v1', embeddingRoutes);
  app.use('/v1', searchRoutes);
  app.use('/v1', retrievalRoutes);
  app.use('/v1', ingestionRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'not_found',
      message: 'Route not found',
      statusCode: 404,
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    errorHandler(err, _req, res, _next);
  });

  return app;
};
