import { Router } from 'express';
import { ResumeIngestionController } from '../controllers/resumeIngestionController';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();
const controller = new ResumeIngestionController();

router.post('/resume/upload', uploadMiddleware, controller.uploadResume.bind(controller));
router.post('/resume/extract', uploadMiddleware, controller.extractResume.bind(controller));
router.post('/resume/clean', uploadMiddleware, controller.cleanResume.bind(controller));
router.post('/resume/parse', uploadMiddleware, controller.parseResume.bind(controller));
router.post('/resume/skills', uploadMiddleware, controller.detectSkills.bind(controller));
router.post('/resume/llm-parse', uploadMiddleware, controller.llmParseResume.bind(controller));
router.post('/resume/embed', uploadMiddleware, controller.embedResume.bind(controller));
router.post('/resume/store', uploadMiddleware, controller.storeResume.bind(controller));
router.post('/resume/inject', uploadMiddleware, controller.injectResume.bind(controller));

export default router;
