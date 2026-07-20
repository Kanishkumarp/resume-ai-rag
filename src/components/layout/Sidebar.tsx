import { useChatStore } from '../../lib/stores/chat.store';
import { useSearchStore } from '../../lib/stores/search.store';
import { BrandAvatar } from './BrandAvatar';
import { ClearChatButton } from './ClearChatButton';
import { HybridWeightPanel } from './HybridWeightPanel';
import { ResultsLimitSelect } from './ResultsLimitSelect';
import { SearchModeNav } from './SearchModeNav';

export function Sidebar() {
  const mode = useSearchStore((state) => state.mode);
  const reset = useSearchStore((state) => state.reset);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const handleReset = () => {
    reset();
    clearMessages();
  };

  return (
    <aside className="w-full shrink-0 rounded-3xl border border-white/10 bg-slate-900/75 p-4 shadow-2xl shadow-black/30 backdrop-blur xl:w-80 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto">
      <div className="space-y-4">
        <BrandAvatar />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Search mode</p>
          <SearchModeNav activeMode={mode} onChange={(value) => useSearchStore.getState().setMode(value)} />
        </div>

        {mode === 'hybrid' ? <HybridWeightPanel /> : null}

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
          <p className="text-sm font-semibold text-white">Results</p>
          <div className="mt-2">
            <ResultsLimitSelect />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 transition hover:border-indigo-400/20 hover:text-white"
          >
            Reset filters
          </button>
          <ClearChatButton />
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-400">
          Search pipeline ready for uploaded resumes and recruiter queries.
        </div>
      </div>
    </aside>
  );
}
