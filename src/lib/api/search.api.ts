import apiClient from './client';
import type { SearchMode, SearchRequest, SearchResult } from '../../types/search.types';
import { normalizeResults } from './searchResultNormalizer';

export interface SearchResponse {
  results: SearchResult[];
  mode?: SearchMode;
  message?: string;
  duration?: number;
  rerankApplied?: boolean;
  warnings?: string[];
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
  const startedAt = performance.now();
  const response = await apiClient.post<unknown>(getSearchEndpoint(mode), {
    query: request.query,
    topK: request.limit ?? 5,
    mode,
    weights: request.weights,
    filters: request.filters,
  }, { signal });

  const payload = response.data as Record<string, unknown>;
  const results = normalizeResults(payload);
  const timings = typeof payload.timings === 'object' && payload.timings !== null
    ? payload.timings as Record<string, unknown>
    : {};

  return {
    results,
    mode,
    message: typeof payload.message === 'string' ? payload.message : undefined,
    duration: typeof timings.totalMs === 'number' ? timings.totalMs : Math.round(performance.now() - startedAt),
    rerankApplied: typeof payload.rerankApplied === 'boolean' ? payload.rerankApplied : undefined,
    warnings: Array.isArray(payload.warnings) ? payload.warnings.filter((warning): warning is string => typeof warning === 'string') : undefined,
  };
}

export async function summarizeCandidate(payload: { query: string; candidate: unknown; style?: string; maxTokens?: number }) {
  const response = await apiClient.post<{ summary?: string }>('/v1/search/summarize', payload);
  return response.data;
}
