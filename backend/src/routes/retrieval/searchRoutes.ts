import { Router } from 'express';

const router = Router();

router.post('/search', async (_req, res) => {
  res.status(200).json({
    message: 'Retrieval endpoint is ready.',
    status: 'ok',
  });
});

export default router;
