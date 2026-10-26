import { useMemo, useState } from 'react';
import { searchResumes } from '../../../lib/api/search.api';
import { useSearchStore } from '../../../lib/stores/search.store';
import type { SearchResult } from '../../../types/search.types';
import { CandidateResultsList } from './CandidateResultsList';

export function CandidateSearchPanel() {
  const [query, setQuery] = useState('backend engineer');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const weights = useSearchStore((state) => state.weights);
  const setMode = useSearchStore((state) => state.setMode);
  const setLimit = useSearchStore((state) => state.setLimit);

  const runSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchResumes({ query: query.trim(), mode, limit, weights });
      const nextResults = response.results ?? [];
      setResults(nextResults);
      setSelectedId(nextResults[0]?.id ?? null);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed');
      setResults([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => `${results.length} result${results.length === 1 ? '' : 's'}`, [results.length]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-white/[0.07] bg-bg-card p-6 shadow-lg shadow-black/20">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Candidate Search</h2>
        <p className="mt-1 text-sm text-text-muted">Search resumes across BM25, vector, and hybrid modes with the shared sidebar controls.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 rounded-xl border border-white/[0.07] bg-bg-surface px-4 py-3 text-text-primary outline-none"
          placeholder="Search candidates"
        />

        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as 'bm25' | 'vector' | 'hybrid')}
          className="rounded-xl border border-white/[0.07] bg-bg-surface px-4 py-3 text-text-primary"
        >
          <option value="bm25">BM25</option>
          <option value="vector">Vector</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <select
          value={limit}
          onChange={(event) => setLimit(Number(event.target.value))}
          className="rounded-xl border border-white/[0.07] bg-bg-surface px-4 py-3 text-text-primary"
        >
          <option value={3}>3 results</option>
          <option value={5}>5 results</option>
          <option value={10}>10 results</option>
          <option value={20}>20 results</option>
        </select>

        <button
          onClick={() => void runSearch()}
          className="rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white transition hover:bg-indigo-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="mt-4 text-sm text-text-muted">{summary} · {mode.toUpperCase()} · top {limit}</div>

      {error ? <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div> : null}

      <div className="mt-4">
        <CandidateResultsList results={results} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
