import { Router } from 'express';
import { env } from '../../config/environment';
import { SearchService } from '../../services/searchService';

const router = Router();
const searchService = new SearchService();

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

    const results = await searchService.bm25Search(query, filters, Number.isFinite(topK) ? topK : 10);
    res.status(200).json({ query, topK: Number.isFinite(topK) ? topK : 10, results, source: 'bm25', index: { name: env.mongoBm25Index || 'BM25' } });
  } catch (error) {
    next(error);
  }
});

export default router;
