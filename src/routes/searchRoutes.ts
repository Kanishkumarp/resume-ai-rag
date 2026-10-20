import { Router, Request, Response, NextFunction } from 'express';
import bm25Routes from './search/bm25Routes';
import vectorRoutes from './search/vectorRoutes';
import hybridRoutes from './search/hybridRoutes';
import rerankRoutes from './search/rerankRoutes';
import summarizeRoutes from './search/summarizeRoutes';
import endToEndRoutes from './search/endToEndRoutes';
import { ResumeRepository, ResumeDocument } from '../repositories/resumeRepository';
import { requireApiAccessToken } from '../middleware/apiAccess';

const router = Router();
const resumeRepository = new ResumeRepository();

const validateCandidateId = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Candidate id must be a non-empty string.');
  }
  return value.trim();
};

const normalizeSkills = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof skills === 'string') {
    return skills.split(/[,;\n]/).map((skill) => skill.trim()).filter((skill) => skill.length > 0);
  }
  return [];
};

const buildCandidateProfilePayload = (document: ResumeDocument) => ({
  _id: String(document._id ?? document.resumeId ?? ''),
  resumeId: typeof document.resumeId === 'string' ? document.resumeId : undefined,
  name: document.name ?? 'Candidate profile',
  title: document.role ?? document.company ?? 'Resume profile',
  company: document.company,
  summary: document.text ?? undefined,
  skills: normalizeSkills(document.skills),
  location: typeof document.location === 'string' ? document.location : undefined,
  experienceYears: typeof document.totalExperience === 'number' ? document.totalExperience : typeof document.relevantExperience === 'number' ? document.relevantExperience : undefined,
  source: 'search' as const,
  email: typeof document.email === 'string' ? document.email : undefined,
  phone: typeof document.phone === 'string' ? document.phone : undefined,
});

const getCandidateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = validateCandidateId(req.params.id);
    const document = await resumeRepository.getDocumentById(candidateId);

    if (!document) {
      res.status(404).json({ error: 'candidate_not_found', message: 'Candidate not found.', statusCode: 404 });
      return;
    }

    res.status(200).json(buildCandidateProfilePayload(document));
  } catch (error) {
    next(error);
  }
};

router.use('/search', requireApiAccessToken);
router.use('/search/bm25', bm25Routes);
router.use('/search/vector', vectorRoutes);
router.use('/search/hybrid', hybridRoutes);
router.use('/search/rerank', rerankRoutes);
router.use('/search/summarize', summarizeRoutes);
router.use('/search', endToEndRoutes);

router.get('/search/:id', getCandidateProfile);
router.get('/candidate/:id', requireApiAccessToken, getCandidateProfile);

export default router;
