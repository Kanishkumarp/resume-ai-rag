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
  hybridResults: data.hybridResults ?? data.results,
  rerankApplied: data.rerankApplied ?? false,
});

const validateQuery = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 1000) {
    throw Object.assign(new Error('Query must be a non-empty string of at most 1000 characters.'), { status: 400 });
  }
  return value.trim();
};

const validateTopK = (value: unknown): number => {
  const topK = value === undefined ? 10 : Number(value);
  if (!Number.isInteger(topK) || topK < 1 || topK > 50) {
    throw Object.assign(new Error('topK must be an integer between 1 and 50.'), { status: 400 });
  }
  return topK;
};

router.post('/', async (req, res, next) => {
  try {
    const query = validateQuery(req.body?.query);
    const topK = validateTopK(req.body?.topK);
    const filters = req.body?.filters ?? {};
    const weights = (req.body?.weights ?? {}) as { bm25?: number; vector?: number };

    const data = await searchService.hybridSearchWithReranking(query, filters, topK, weights);
    res.locals.componentTimings = {
      bm25Ms: data.timings.bm25Ms,
      vectorMs: data.timings.vectorMs,
      rerankMs: data.timings.rerankMs,
    };
    res.status(200).json(buildHybridRoutePayload(data, query, topK));
  } catch (error) {
    next(error);
  }
});

export default router;
