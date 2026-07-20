import * as express from 'express';

const router = express.Router();

router.get('/retrieval/health', (_req, res) => {
  res.json({ success: true, message: 'Retrieval module is running' });
});

export default router;
