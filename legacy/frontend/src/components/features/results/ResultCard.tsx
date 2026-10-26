import { useSearchStore } from '../../../lib/stores/search.store';
import { getScoreBreakdown, getScoreDisplayMeta } from '../../../lib/utils/searchScore';
import type { SearchMode, SearchResult } from '../../../types/search.types';

interface ResultCardProps {
  result: SearchResult;
  selected?: boolean;
  mode?: SearchMode;
}

export function ResultCard({ result, selected, mode }: ResultCardProps) {
  const activeMode = useSearchStore((state) => state.mode);
  const resolvedMode = mode ?? activeMode;
  const scoreMeta = getScoreDisplayMeta(result, resolvedMode);
  const showBreakdown = resolvedMode === 'hybrid';
  const breakdown = getScoreBreakdown(result, resolvedMode);
  const label = resolvedMode === 'bm25' ? 'BM25' : resolvedMode === 'vector' ? 'Vector' : scoreMeta.label;
  const breakdownText = resolvedMode === 'hybrid'
    ? `Hybrid ${breakdown.hybrid?.toFixed(3) ?? '0.000'} • BM25 ${breakdown.bm25?.toFixed(3) ?? '0.000'} • Vector ${breakdown.vector?.toFixed(3) ?? '0.000'}`
    : `${label} ${scoreMeta.value.toFixed(3)}`;
  const badgeClasses = resolvedMode === 'bm25'
    ? 'score-badge score-badge--bm25'
    : resolvedMode === 'vector'
      ? 'score-badge score-badge--vector'
      : 'score-badge score-badge--hybrid';

  return (
    <div className={`candidate-result-card${selected ? ' is-selected' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="result-name">{result.name}</p>
          <p className="result-title">{result.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`${badgeClasses}`}>{scoreMeta.value.toFixed(3)} {label}</span>
          {showBreakdown ? (
            <span className="text-[11px] text-slate-400">{breakdownText}</span>
          ) : null}
        </div>
      </div>
      <p className="result-summary mt-3 line-clamp-3 text-sm text-slate-300">{result.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {result.location ? <span className="result-meta-chip">{result.location}</span> : null}
        {result.skills?.slice(0, 3).map((skill) => (
          <span key={skill} className="result-meta-chip">{skill}</span>
        ))}
      </div>
    </div>
  );
}
