import { useEffect, useRef, useState } from 'react';
import { ChatInputBar } from './ChatInputBar';
import { ChatMessages } from './ChatMessages';
import { ChatTopbar } from './ChatTopbar';
import { SuggestionChips } from './SuggestionChips';
import { useChatStore } from '../../../lib/stores/chat.store';
import { useSearchStore } from '../../../lib/stores/search.store';
import { searchResumes } from '../../../lib/api/search.api';
import type { SearchResult } from '../../../types/search.types';
import { ResultsList } from '../results/ResultsList';
import { useCandidateModal } from '../../../hooks/use-candidate-modal';
import { CandidateModal } from '../candidate/CandidateModal';

export function shouldShowSuggestionChips(messages: Array<{ role?: string }>) {
  return messages.length === 0;
}

export function ChatMain() {
  const [draft, setDraft] = useState('');
  const messages = useChatStore((state) => state.messages);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const addBotMessage = useChatStore((state) => state.addBotMessage);
  const replaceMessages = useChatStore((state) => state.replaceMessages);
  const setTyping = useChatStore((state) => state.setTyping);
  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const weights = useSearchStore((state) => state.weights);
  const filters = useSearchStore((state) => state.filters);
  const { candidate, open, openModal, close, loading, error } =
    useCandidateModal();
  const activeSearch = useRef<{
    id: number;
    controller: AbortController;
  } | null>(null);
  const nextSearchId = useRef(0);

  useEffect(() => () => activeSearch.current?.controller.abort(), []);

  const canSubmit = draft.trim().length > 0;

  const sendMessage = async (content?: string) => {
    const trimmed = (content ?? draft).trim();
    if (!trimmed) return;

    activeSearch.current?.controller.abort();
    const search = {
      id: ++nextSearchId.current,
      controller: new AbortController(),
    };
    activeSearch.current = search;
    replaceMessages([]);
    addUserMessage(trimmed);
    setDraft('');
    setTyping(true);

    try {
      const response = await searchResumes(
        { query: trimmed, mode, limit, weights, filters },
        search.controller.signal,
      );
      if (activeSearch.current?.id !== search.id) return;
      const nextResults: SearchResult[] = response.results.slice(0, limit);
      const summaryText =
        response.message ??
        (nextResults.length > 0
          ? `Showing ${nextResults.length} ranked matches for “${trimmed}”.${response.rerankApplied ? ' Reranked by Groq.' : ''}`
          : `No matches were found for “${trimmed}”.`);

      addBotMessage(
        <div className="space-y-3">
          <p className="font-semibold text-white">Search complete</p>
          <p className="text-sm text-slate-300">{summaryText}</p>
          {response.warnings?.length ? (
            <p className="text-xs text-amber-200/80">{response.warnings.join(' ')}</p>
          ) : null}
          {nextResults.length > 0 ? (
            <ResultsList
              results={nextResults}
              query={trimmed}
              mode={mode}
              duration={response.duration}
              onOpenCandidate={(candidateId) => {
                const selected = nextResults.find(
                  (result) => result.id === candidateId,
                );
                void openModal(candidateId, selected);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-400">
              Try a broader query such as “backend engineer”, “full stack
              developer”, or “data engineer”.
            </div>
          )}
        </div>,
      );
    } catch (error) {
      if (activeSearch.current?.id !== search.id) return;
      addBotMessage(
        `The search service is unavailable right now. ${error instanceof Error ? error.message : 'Please check the backend connection.'}`,
      );
    } finally {
      if (activeSearch.current?.id === search.id) {
        activeSearch.current = null;
        setTyping(false);
      }
    }
  };

  return (
    <div className="flex min-h-[640px] w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d0c]/95 shadow-2xl shadow-black/30 lg:min-h-[min(74vh,860px)]">
      <ChatTopbar />
      <ChatMessages />
      {shouldShowSuggestionChips(messages) ? (
        <SuggestionChips onSelect={(value) => void sendMessage(value)} />
      ) : null}
      <ChatInputBar
        value={draft}
        onChange={setDraft}
        onSubmit={() => void sendMessage()}
        disabled={!canSubmit}
      />
      <CandidateModal
        candidate={candidate}
        open={open}
        loading={loading}
        error={error}
        mode={mode}
        onClose={close}
      />
    </div>
  );
}
