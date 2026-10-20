import { useSearchStore } from '../../../lib/stores/search.store';
import { getScoreDisplayMeta } from '../../../lib/utils/searchScore';

interface CandidateResultCardProps {
  id: string;
  name: string;
  title?: string;
  score: number;
  source?: string;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  summary?: string;
  skills?: string[];
  bm25Score?: number;
  vectorScore?: number;
  hybridScore?: number;
}

export function CandidateResultsList({
  results,
  onSelect,
  selectedId,
}: {
  results: CandidateResultCardProps[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  const activeMode = useSearchStore((state) => state.mode);

  if (!results.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onSelect?.(result.id)}
          className={`w-full rounded-xl border p-4 text-left transition ${
            selectedId === result.id
              ? 'border-indigo-400/30 bg-indigo-500/10'
              : 'border-white/[0.07] bg-bg-surface hover:border-indigo-400/20'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-text-primary">{result.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{result.title ?? 'Candidate profile'}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {getScoreDisplayMeta(result, activeMode).value.toFixed(3)} {getScoreDisplayMeta(result, activeMode).label}
              </div>
              <div className="text-[11px] text-text-muted">
                {getScoreDisplayMeta(result, activeMode).label} {getScoreDisplayMeta(result, activeMode).value.toFixed(3)} • BM25 {typeof result.bm25Score === 'number' ? result.bm25Score.toFixed(3) : '0.000'} • Vector {typeof result.vectorScore === 'number' ? result.vectorScore.toFixed(3) : '0.000'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-text-muted">{result.source}</div>
          {result.summary ? <div className="mt-2 text-sm text-text-muted">{result.summary}</div> : null}
          {result.skills?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/[0.07] px-2.5 py-1 text-xs text-text-muted">{skill}</span>
              ))}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
