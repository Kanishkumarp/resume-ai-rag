import { useState } from 'react';
import { ResumeUploadCard } from '../../features/ingestion/components/ResumeUploadCard';
import { searchResumes } from '../../lib/api/search.api';
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
  const weights = useSearchStore((state) => state.weights);
  const limit = useSearchStore((state) => state.limit);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleReset = () => {
    reset();
    clearMessages();
    setError(null);
    setResultMessage(null);
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query before submitting.');
      setResultMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const response = await searchResumes({ query: query.trim(), mode: 'hybrid', limit, weights });
      setResultMessage(`${response.results.length} result${response.results.length === 1 ? '' : 's'} returned`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-inner">
      <div className="sidebar-content">
        <BrandAvatar />

        <div className="sidebar-panel">
          <ResumeUploadCard />
        </div>

        <div>
          <p className="sidebar-section-label">Search mode</p>
          <SearchModeNav activeMode={mode} onChange={(value) => useSearchStore.getState().setMode(value)} />
        </div>

        {mode === 'hybrid' ? <HybridWeightPanel /> : null}

        <div className="sidebar-panel">
          <p className="sidebar-heading">Results</p>
          <div className="mt-2">
            <ResultsLimitSelect />
          </div>
        </div>

        <div className="sidebar-panel sidebar-search">
          <div className="mb-3 flex items-center justify-between">
            <p className="sidebar-heading">Quick search check</p>
            <span className="sidebar-hint">Hybrid</span>
          </div>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={4}
            placeholder="Try a role or skill combination"
          />
          {error ? (
            <div className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          ) : null}
          {resultMessage ? (
            <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {resultMessage}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="sidebar-submit mt-3"
          >
            {loading ? 'Checking…' : 'Check results'}
          </button>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            New search
          </button>
          <ClearChatButton />
        </div>

        <div className="sidebar-status">
          Choose a retrieval mode and search across your indexed resumes.
        </div>
      </div>
    </div>
  );
}
