import { Router } from 'express';
import { createApiSession } from '../middleware/apiAccess';

const router = Router();

router.post('/auth/session', createApiSession);

export default router;
