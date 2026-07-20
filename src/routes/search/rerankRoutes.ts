import { Router } from 'express';
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
    const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates : [];
    const topK = Number(req.body?.topK ?? 10);

    if (candidates.length === 0) {
      res.status(400).json({ error: 'invalid_request', message: 'Body must include a non-empty candidates array.', statusCode: 400 });
      return;
    }

    const rerankResult = await searchService.rerankCandidates(query, candidates, Number.isFinite(topK) ? topK : 10);
    res.locals.componentTimings = { rerankMs: rerankResult.timings.rerankMs };
    res.status(200).json({ query, results: rerankResult.results, source: 'rerank', warnings: rerankResult.warnings, timings: rerankResult.timings });
  } catch (error) {
    next(error);
  }
});

export default router;
