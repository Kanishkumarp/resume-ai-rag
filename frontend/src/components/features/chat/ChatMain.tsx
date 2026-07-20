import { useState } from 'react';
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
  const setTyping = useChatStore((state) => state.setTyping);
  const isTyping = useChatStore((state) => state.isTyping);
  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const weights = useSearchStore((state) => state.weights);
  const { candidate, open, openModal, close, loading } = useCandidateModal();

  const canSubmit = draft.trim().length > 0 && !isTyping;

  const sendMessage = async (content?: string) => {
    const trimmed = (content ?? draft).trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setDraft('');
    setTyping(true);

    try {
      const response = await searchResumes({ query: trimmed, mode, limit, weights });
      const nextResults: SearchResult[] = response.results.slice(0, limit);
      const summaryText = response.message ?? (nextResults.length > 0 ? `Showing ${nextResults.length} ranked matches for “${trimmed}”.` : `No matches were found for “${trimmed}”.`);

      addBotMessage(
        <div className="space-y-3">
          <p className="font-semibold text-white">Search complete</p>
          <p className="text-sm text-slate-300">{summaryText}</p>
          {nextResults.length > 0 ? (
            <ResultsList
              results={nextResults}
              query={trimmed}
              mode={mode}
              duration={response.duration}
              onOpenCandidate={(candidateId) => {
                const selected = nextResults.find((result) => result.id === candidateId);
                void openModal(candidateId, selected);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-400">
              Try a broader query such as “backend engineer”, “full stack developer”, or “data engineer”.
            </div>
          )}
        </div>,
      );
    } catch (error) {
      addBotMessage(`The search service is unavailable right now. ${error instanceof Error ? error.message : 'Please check the backend connection.'}`);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/25">
      <ChatTopbar />
      <ChatMessages />
      {shouldShowSuggestionChips(messages) ? <SuggestionChips onSelect={(value) => void sendMessage(value)} /> : null}
      <ChatInputBar value={draft} onChange={setDraft} onSubmit={() => void sendMessage()} disabled={!canSubmit} />
      <CandidateModal candidate={candidate} open={open} loading={loading} mode={mode} onClose={close} />
    </div>
  );
}
