import { useSearchStore } from '../../../lib/stores/search.store';
import { BrainCircuit, Search, Sparkles } from 'lucide-react';

export function ChatTopbar() {
  const mode = useSearchStore((state) => state.mode);

  const modeLabel =
    mode === 'bm25'
      ? 'Keyword retrieval'
      : mode === 'vector'
        ? 'Semantic retrieval'
        : 'Hybrid retrieval';
  const ModeIcon =
    mode === 'bm25' ? Search : mode === 'vector' ? BrainCircuit : Sparkles;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Candidate discovery
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Search resumes</h2>
          <span className="hidden text-slate-700 sm:inline">/</span>
          <p className="hidden text-xs text-slate-400 sm:block">{modeLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-red-400/15 bg-red-500/[0.07] px-3 py-1.5 text-xs font-medium text-red-200">
        <ModeIcon size={14} />
        <span>
          {mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid'}
        </span>
      </div>
    </div>
  );
}
