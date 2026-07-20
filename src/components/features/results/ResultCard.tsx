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
    ? 'bg-pink-500/15 text-pink-300'
    : resolvedMode === 'vector'
      ? 'bg-indigo-500/15 text-indigo-300'
      : 'bg-emerald-500/15 text-emerald-300';

  return (
    <div className={`rounded-2xl border p-4 transition hover:border-white/[0.12] hover:shadow-lg ${selected ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-white/10 bg-slate-900/70'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{result.name}</p>
          <p className="mt-1 text-sm text-slate-400">{result.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses}`}>{scoreMeta.value.toFixed(3)} {label}</span>
          {showBreakdown ? (
            <span className="text-[11px] text-slate-400">{breakdownText}</span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-slate-300">{result.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {result.location ? <span className="rounded-full border border-white/10 px-2.5 py-1">{result.location}</span> : null}
        {result.skills?.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-full border border-white/10 px-2.5 py-1">{skill}</span>
        ))}
      </div>
    </div>
  );
}
