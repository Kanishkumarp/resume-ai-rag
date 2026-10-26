export interface HealthResponse {
  status: 'ok' | 'degraded';
  app: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  checks?: {
    database?: {
      status: 'ok' | 'error' | 'degraded';
      latencyMs?: number;
      error?: string;
    };
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  requestId?: string;
}

export interface SearchCandidate {
  resumeId: string;
  name?: string;
  company?: string;
  role?: string;
  location?: string;
  skills?: string[];
  experienceYears?: number;
  education?: string;
  snippet: string;
  score: number;
  source: 'bm25' | 'vector' | 'hybrid';
  matchType?: 'bm25' | 'vector' | 'hybrid';
  rank?: number;
  summary?: string;
  bm25Score?: number;
  vectorScore?: number;
  bm25RawScore?: number;
  vectorRawScore?: number;
  hybridScore?: number;
  rerankScore?: number;
  relevanceExplanation?: string;
  evidence?: string[];
}

export interface HybridSearchResponse {
  bm25Results: SearchCandidate[];
  vectorResults: SearchCandidate[];
  results: SearchCandidate[];
  warnings: string[];
  source: 'hybrid';
  index: { name: string; dimensions: number; similarity: 'cosine' };
  vectorFallback: boolean;
  bm25Fallback: boolean;
  hybridResults?: SearchCandidate[];
  timings: { bm25Ms: number; vectorMs: number; rerankMs?: number };
  rerankApplied?: boolean;
}
