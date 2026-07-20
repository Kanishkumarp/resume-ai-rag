import { Router } from 'express';
import bm25Routes from './search/bm25Routes';
import vectorRoutes from './search/vectorRoutes';
import hybridRoutes from './search/hybridRoutes';
import rerankRoutes from './search/rerankRoutes';
import summarizeRoutes from './search/summarizeRoutes';
import endToEndRoutes from './search/endToEndRoutes';

const router = Router();

router.use('/search/bm25', bm25Routes);
router.use('/search/vector', vectorRoutes);
router.use('/search/hybrid', hybridRoutes);
router.use('/search/rerank', rerankRoutes);
router.use('/search/summarize', summarizeRoutes);
router.use('/search', endToEndRoutes);

export default router;
