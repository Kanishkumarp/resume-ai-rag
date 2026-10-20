import { Router } from 'express';
import { requireApiAccessToken } from '../../../../src/middleware/apiAccess';

const router = Router();

router.use(requireApiAccessToken);
router.post('/resume/inject', async (_req, res) => {
  res.status(200).json({
    message: 'Resume ingestion endpoint is ready.',
    status: 'ok',
  });
});

export default router;
