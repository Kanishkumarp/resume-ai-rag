import apiClient from './client';
import type { SearchMode, SearchRequest, SearchResult } from '../../types/search.types';
import { normalizeResults } from './searchResultNormalizer';

export interface SearchResponse {
  results: SearchResult[];
  mode?: SearchMode;
  message?: string;
  duration?: number;
}

export { extractCandidateMetadata, normalizeResults } from './searchResultNormalizer';

export function getSearchEndpoint(mode: SearchMode): string {
  if (mode === 'bm25') {
    return '/v1/search/bm25';
  }

  if (mode === 'vector') {
    return '/v1/search/vector';
  }

  return '/v1/search/hybrid';
}

export async function searchResumes(request: SearchRequest, signal?: AbortSignal): Promise<SearchResponse> {
  const mode: SearchMode = request.mode ?? 'hybrid';
  const response = await apiClient.post<unknown>(getSearchEndpoint(mode), {
    query: request.query,
    topK: request.limit ?? 5,
    mode,
    weights: request.weights,
  }, { signal });

  const payload = response.data as Record<string, unknown>;
  const results = normalizeResults(payload);

  return {
    results,
    mode,
    message: typeof payload.message === 'string' ? payload.message : undefined,
    duration: typeof payload.duration === 'number' ? payload.duration : undefined,
  };
}

export async function summarizeCandidate(payload: { query: string; candidate: unknown; style?: string; maxTokens?: number }) {
  const response = await apiClient.post<{ summary?: string }>('/v1/search/summarize', payload);
  return response.data;
}
