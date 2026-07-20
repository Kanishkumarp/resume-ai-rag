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
    const candidate = req.body?.candidate;
    const style = req.body?.style === 'detailed' ? 'detailed' : 'short';
    const maxTokens = Number(req.body?.maxTokens ?? 220);

    if (!candidate || typeof candidate !== 'object') {
      res.status(400).json({ error: 'invalid_request', message: 'Body must include a candidate object.', statusCode: 400 });
      return;
    }

    const summary = await searchService.summarizeCandidate(query, candidate as Parameters<typeof searchService.summarizeCandidate>[1], {
      style,
      maxTokens: Number.isFinite(maxTokens) ? maxTokens : 220,
    });

    res.locals.componentTimings = { summarizeMs: 1 };
    res.status(200).json({ query, candidate, summary, source: 'summarize', style, maxTokens: Number.isFinite(maxTokens) ? maxTokens : 220 });
  } catch (error) {
    next(error);
  }
});

export default router;
