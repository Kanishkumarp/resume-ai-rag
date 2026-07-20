import type { SearchMode, SearchResult } from '../../../types/search.types';
import { EmptyState } from '../../common/EmptyState';
import { ResultCard } from './ResultCard';

interface ResultsListProps {
  results: SearchResult[];
  query?: string;
  mode?: SearchMode;
  duration?: number;
  onOpenCandidate?: (candidateId: string) => void;
}

export function ResultsList({ results, query, mode, duration, onOpenCandidate }: ResultsListProps) {
  if (!results.length) {
    return <EmptyState title="No matches yet" description="Try a broader query to surface more candidates from the uploaded resume set." />;
  }

  const modeLabel = mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid';

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-white">Top matches</p>
          <p className="text-xs text-slate-400">
            {query ? `Showing ${results.length} ranked matches for “${query}”` : `Showing ${results.length} ranked matches`}
          </p>
        </div>
        <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-indigo-300">
          {modeLabel} • {duration ? `${duration}ms` : 'live'}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <button
            key={result.id}
            type="button"
            onClick={() => onOpenCandidate?.(result.id)}
            className="w-full text-left"
          >
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-2 transition hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-slate-900/90">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">#{index + 1}</span>
                <span className="text-xs text-slate-400">{result.location ?? 'Remote'}</span>
              </div>
              <ResultCard result={result} mode={mode} />
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">Click to view profile</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
