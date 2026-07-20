import { useMemo } from 'react';
import { useHybridWeights } from '../../../hooks/use-hybrid-weights';
import { useSearchStore } from '../../../lib/stores/search.store';
import { HybridWeightPanel } from './HybridWeightPanel';
import { ResultsLimitSelect } from './ResultsLimitSelect';
import { SearchModeNav } from './SearchModeNav';

export function Sidebar() {
  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const setMode = useSearchStore((state) => state.setMode);
  const setLimit = useSearchStore((state) => state.setLimit);
  const reset = useSearchStore((state) => state.reset);
  const { weights, updateWeight, applyPreset } = useHybridWeights();

  const weightsSummary = useMemo(() => `${weights.bm25}% / ${weights.vector}%`, [weights.bm25, weights.vector]);

  return (
    <aside className="w-full rounded-2xl border border-white/[0.07] bg-bg-card p-4 shadow-lg shadow-black/20 xl:w-72">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-900/30">
          <span className="text-lg font-semibold text-white">R</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">RecruitBot</p>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">Workspace controls</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-text-muted">Search mode</div>
          <SearchModeNav activeMode={mode} onChange={setMode} />
        </div>

        <HybridWeightPanel
          activeMode={mode}
          bm25Weight={weights.bm25}
          vectorWeight={weights.vector}
          onBm25Change={(value) => updateWeight('bm25', value)}
          onVectorChange={(value) => updateWeight('vector', value)}
          onPresetChange={applyPreset}
        />

        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-text-muted">Results</div>
          <ResultsLimitSelect value={limit} onChange={setLimit} />
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-3 text-sm text-text-muted">
          <div className="font-medium text-text-primary">Weights</div>
          <div className="mt-1">{weightsSummary}</div>
          <div className="mt-1 text-xs text-text-muted">Top results: {limit}</div>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="w-full rounded-xl border border-white/[0.07] bg-bg-surface px-3 py-2 text-sm text-text-muted transition hover:border-indigo-400/20 hover:text-text-primary"
        >
          Reset filters
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
        Search pipeline ready for uploaded resumes
      </div>
    </aside>
  );
}
