export type CandidateProfile = {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  matchScore?: number;
  bm25Score?: number;
  vectorScore?: number;
  hybridScore?: number;
  source?: string;
  experienceYears?: number;
  experience?: Array<{
    role: string;
    company: string;
    years?: number;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  projects?: Array<{
    title: string;
    description?: string;
  }>;
  certifications?: string[];
};
