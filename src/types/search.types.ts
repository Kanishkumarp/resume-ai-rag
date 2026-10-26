export type SearchMode = 'bm25' | 'vector' | 'hybrid';

export type SearchFilters = {
  skills?: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  location?: string;
  title?: string;
  education?: string;
};

export type SearchRequest = {
  query: string;
  mode?: SearchMode;
  limit?: number;
  filters?: SearchFilters;
  weights?: {
    bm25: number;
    vector: number;
  };
  generateAnswer?: boolean;
};

export type SearchResult = {
  id: string;
  name: string;
  title: string;
  company?: string;
  score: number;
  summary: string;
  location?: string;
  skills?: string[];
  source?: string;
  email?: string;
  phone?: string;
  experienceYears?: number;
  educationSummary?: string;
  bm25Score?: number;
  vectorScore?: number;
  bm25RawScore?: number;
  vectorRawScore?: number;
  hybridScore?: number;
  rerankScore?: number;
  relevanceExplanation?: string;
  evidence?: string[];
  experience?: Array<{
    role: string;
    company: string;
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
