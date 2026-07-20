import { Router } from 'express';
import { SearchService } from '../../services/searchService';
import type { HybridSearchResponse } from '../../types/common';

const router = Router();
const searchService = new SearchService();

export const buildHybridRoutePayload = (
  data: HybridSearchResponse,
  query: string,
  topK: number,
) => ({
  query,
  topK,
  results: data.results,
  warnings: data.warnings,
  source: 'hybrid' as const,
  index: data.index,
  vectorFallback: data.vectorFallback,
  bm25Fallback: data.bm25Fallback,
  timings: data.timings,
  hybridResults: data.results,
});

const validateQuery = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Query must be a non-empty string.');
  }
  return value.trim();
};

router.post('/', async (req, res, next) => {
  try {
    const query = validateQuery(req.body?.query);
    const topK = Number(req.body?.topK ?? 10);
    const filters = (req.body?.filters ?? {}) as Record<string, unknown>;
    const weights = (req.body?.weights ?? {}) as { bm25?: number; vector?: number };

    const data = await searchService.hybridSearch(query, filters, Number.isFinite(topK) ? topK : 10, weights);
    res.locals.componentTimings = {
      bm25Ms: data.timings.bm25Ms,
      vectorMs: data.timings.vectorMs,
    };
    res.status(200).json(buildHybridRoutePayload(data, query, Number.isFinite(topK) ? topK : 10));
  } catch (error) {
    next(error);
  }
});

export default router;
