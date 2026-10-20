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
    <div className="result-list">
      <div className="result-list-header">
        <div>
          <p className="result-list-title">Top matches</p>
          <p className="result-list-subtitle">
            {query ? `Showing ${results.length} ranked matches for “${query}”` : `Showing ${results.length} ranked matches`}
          </p>
        </div>
        <div className="mode-chip">
          {modeLabel} • {duration ? `${duration}ms` : 'live'}
        </div>
      </div>

      <div className="space-y-2.5">
        {results.map((result, index) => (
          <button
            key={result.id}
            type="button"
            onClick={() => onOpenCandidate?.(result.id)}
            className="result-row-button"
          >
            <div className="result-row">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">#{index + 1}</span>
                <span className="text-xs text-slate-400">{result.location ?? 'Remote'}</span>
              </div>
              <ResultCard result={result} mode={mode} />
              <p className="result-row-hint">Select to view candidate profile</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
