import { Router } from 'express';
import { env } from '../config/environment';
import { isMongoConfigured, mongoConnection } from '../repositories/mongo';
import { HealthResponse } from '../types/common';

const router = Router();

router.get('/health', async (_req, res, next) => {
  try {
    const response: HealthResponse = {
      status: 'ok',
      app: env.appName,
      version: env.appVersion,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/health/db', async (_req, res) => {
  try {
    const result = await mongoConnection.ping();
    const configured = isMongoConfigured();
    const databaseStatus = result.ok ? 'ok' : 'degraded';
    const overallStatus = result.ok ? 'ok' : 'degraded';
    const errorMessage = result.ok
      ? undefined
      : configured
        ? 'MongoDB is unavailable for the configured environment.'
        : 'MongoDB is not configured for the provided environment values.';

    const response: HealthResponse = {
      status: overallStatus,
      app: env.appName,
      version: env.appVersion,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: databaseStatus,
          latencyMs: result.ok ? result.latencyMs : undefined,
          error: errorMessage,
        },
      },
    };

    res.status(200).json(response);
  } catch {
    const response: HealthResponse = {
      status: 'ok',
      app: env.appName,
      version: env.appVersion,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'degraded',
          error: 'MongoDB is unavailable for the configured environment.',
        },
      },
    };

    res.status(200).json(response);
  }
});

router.get('/health/workspace', async (_req, res, next) => {
  try {
    const collection = await mongoConnection.getCollection();
    const [totalCandidates, latestDocument] = await Promise.all([
      collection.countDocuments({}),
      collection.find({}).sort({ createdAt: -1 }).limit(1).project({ createdAt: 1, _id: 0 }).next(),
    ]);

    res.status(200).json({
      totalCandidates,
      lastIngestionAt: latestDocument?.createdAt ?? null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
