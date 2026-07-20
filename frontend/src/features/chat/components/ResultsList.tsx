import type { SearchResult, SearchMode } from '../../../types/search.types';
import { ResultCard } from './ResultCard';

interface ResultsListProps {
  results: SearchResult[];
  searchType: SearchMode;
  duration?: number;
  query: string;
  onOpenCandidate?: (candidateId: string) => void;
}

function badgeClass(mode: SearchMode) {
  switch (mode) {
    case 'bm25':
      return 'bg-pink-500/10 text-pink-300';
    case 'vector':
      return 'bg-indigo-500/10 text-indigo-300';
    default:
      return 'bg-emerald-500/10 text-emerald-300';
  }
}

export function ResultsList({ results, searchType, duration, query, onOpenCandidate }: ResultsListProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.07] bg-bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-primary">Found {results.length} candidate{results.length === 1 ? '' : 's'}</p>
          <p className="text-xs text-text-muted">{query}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs ${badgeClass(searchType)}`}>{searchType.toUpperCase()}</span>
          {typeof duration === 'number' ? <span className="text-xs text-text-muted">{duration} ms</span> : null}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/[0.07] p-3 text-sm text-text-muted">
          No candidates matched this query.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} onOpenCandidate={onOpenCandidate} />
          ))}
        </div>
      )}
    </div>
  );
}
