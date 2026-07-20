import { motion } from 'framer-motion';
import { useSearchStore } from '../../../lib/stores/search.store';
import { getScoreDisplayMeta } from '../../../lib/utils/searchScore';
import type { SearchResult } from '../../../types/search.types';

interface ResultCardProps {
  result: SearchResult;
  index: number;
  onOpenCandidate?: (candidateId: string) => void;
}

export function ResultCard({ result, index, onOpenCandidate }: ResultCardProps) {
  const activeMode = useSearchStore((state) => state.mode);
  const scoreMeta = getScoreDisplayMeta(result, activeMode);
  const scoreLabel = scoreMeta.label;
  const scoreValue = scoreMeta.value;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onOpenCandidate?.(result.id)}
      className="w-full rounded-xl border border-white/[0.07] bg-bg-card p-4 text-left shadow-sm shadow-black/20 transition hover:-translate-y-0.5 hover:border-indigo-400/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-xs font-semibold text-white">
              #{index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-text-primary">{result.name}</h3>
              <p className="text-sm text-text-muted">{result.title}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
            {scoreValue.toFixed(3)} {scoreLabel}
          </div>
          <div className="text-[11px] text-text-muted">
            {scoreLabel} {scoreValue.toFixed(3)} • BM25 {typeof result.bm25Score === 'number' ? result.bm25Score.toFixed(3) : '0.000'} • Vector {typeof result.vectorScore === 'number' ? result.vectorScore.toFixed(3) : '0.000'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
        {result.experienceYears ? <span className="rounded-full border border-white/[0.07] px-2.5 py-1">{result.experienceYears} yrs</span> : null}
        {result.email ? <span className="rounded-full border border-white/[0.07] px-2.5 py-1">{result.email}</span> : null}
        {result.phone ? <span className="rounded-full border border-white/[0.07] px-2.5 py-1">{result.phone}</span> : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-text-muted">{result.summary}</p>

      {result.skills?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {result.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-full border border-white/[0.07] px-2.5 py-1 text-xs text-text-muted">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </motion.button>
  );
}
