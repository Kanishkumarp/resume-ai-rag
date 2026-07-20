import { Router } from 'express';

const router = Router();

router.post('/resume/inject', async (_req, res) => {
  res.status(200).json({
    message: 'Resume ingestion endpoint is ready.',
    status: 'ok',
  });
});

export default router;
