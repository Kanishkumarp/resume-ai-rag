import { useState } from 'react';
import { searchResumes } from '../lib/api/search.api';
import { useSearchStore } from '../lib/stores/search.store';
import type { SearchRequest, SearchResult } from '../../../../src/types/search.types';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const weights = useSearchStore((state) => state.weights);

  const submitSearch = async (request: SearchRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchResumes({ ...request, mode: request.mode ?? mode, limit: request.limit ?? limit, weights });
      setResults((response.results ?? []).slice(0, request.limit ?? limit));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, submitSearch, mode };
}
