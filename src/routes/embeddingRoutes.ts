import { Router } from 'express';
import { EmbeddingService } from '../services/embeddingService';

const router = Router();
const embeddingService = new EmbeddingService();

router.post('/embeddings', async (req, res, next) => {
  try {
    const { input, model } = req.body ?? {};

    if (typeof input !== 'string' || input.trim().length === 0) {
      res.status(400).json({
        error: 'invalid_request',
        message: 'Body must include a non-empty string field named input',
        statusCode: 400,
      });
      return;
    }

    if (model !== undefined && typeof model !== 'string') {
      res.status(400).json({
        error: 'invalid_request',
        message: 'Optional field model must be a string when provided',
        statusCode: 400,
      });
      return;
    }

    const result = await embeddingService.generateEmbedding(input, model);
    res.status(200).json({
      embedding: result.embedding,
      model: result.model,
      dimensions: result.dimensions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
