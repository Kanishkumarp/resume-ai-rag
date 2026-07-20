import { useSearchStore } from '../../../lib/stores/search.store';

export function ChatTopbar() {
  const mode = useSearchStore((state) => state.mode);

  const modeLabel = mode === 'bm25' ? 'BM25 • Keyword relevance' : mode === 'vector' ? 'Vector • Semantic similarity' : 'Hybrid • Balanced ranking';
  const badgeClasses = mode === 'bm25' ? 'bg-pink-500/20 text-pink-300' : mode === 'vector' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">R</div>
        <div>
          <p className="text-sm font-semibold text-white">RecruitBot assistant</p>
          <p className="text-xs text-slate-400">{modeLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
        <span>Workspace</span>
        <span>/</span>
        <span>Search</span>
        <span>/</span>
        <span className="text-slate-300">{mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid'}</span>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs ${badgeClasses}`}>{mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid'}</span>
    </div>
  );
}
