export type SearchMode = 'bm25' | 'vector' | 'hybrid';

export type SearchRequest = {
  query: string;
  mode?: SearchMode;
  limit?: number;
  weights?: {
    bm25: number;
    vector: number;
  };
};

export type SearchResult = {
  id: string;
  name: string;
  title: string;
  score: number;
  summary: string;
  location?: string;
  skills?: string[];
  source?: string;
  email?: string;
  phone?: string;
  experienceYears?: number;
  bm25Score?: number;
  vectorScore?: number;
  hybridScore?: number;
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
