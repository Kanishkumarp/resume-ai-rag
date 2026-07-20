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
    const topK = Number(req.body?.topK ?? 10);
    const summarize = Boolean(req.body?.summarize);
    const generateAnswer = Boolean(req.body?.generateAnswer);
    const style = req.body?.style === 'detailed' ? 'detailed' : 'short';
    const maxTokens = Number(req.body?.maxTokens ?? 300);
    const filters = (req.body?.filters ?? {}) as Record<string, unknown>;
    const weights = (req.body?.weights ?? {}) as { bm25?: number; vector?: number };
    const mode = req.body?.mode === 'bm25' ? 'bm25' : req.body?.mode === 'vector' ? 'vector' : 'hybrid';

    if (mode === 'bm25') {
      const results = await searchService.bm25Search(query, filters, Number.isFinite(topK) ? topK : 10);
      res.status(200).json({ query, topK: Number.isFinite(topK) ? topK : 10, results, source: 'bm25' });
      return;
    }

    if (mode === 'vector') {
      const results = await searchService.vectorSearch(query, filters, Number.isFinite(topK) ? topK : 10);
      res.status(200).json({ query, topK: Number.isFinite(topK) ? topK : 10, results, source: 'vector' });
      return;
    }

    const result = await searchService.endToEndSearch(query, filters, {
      topK: Number.isFinite(topK) ? topK : 10,
      summarize,
      generateAnswer,
      style,
      maxTokens: Number.isFinite(maxTokens) ? maxTokens : 300,
      weights,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
