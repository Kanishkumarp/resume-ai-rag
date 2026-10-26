import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../../../lib/api/client';
import { searchResumes } from '../../../lib/api/search.api';
import { useChatStore } from '../../../lib/stores/chat.store';
import { useSearchStore } from '../../../lib/stores/search.store';
import type { ChatMessage } from '../../../../../../src/types/chat.types';
import type { SearchMode } from '../../../../../../src/types/search.types';
import { ResultsList } from './ResultsList';

interface RecruiterChatPanelProps {
  candidate?: {
    id: string;
    name: string;
    title?: string;
    score?: number;
    source?: string;
  } | null;
  onOpenCandidate?: (candidateId: string) => void;
}

const suggestionPrompts = [
  'Summarize this candidate for a backend engineering role.',
  'What skills should I prioritize for this profile?',
  'Compare this profile to a senior platform engineer.',
];

export function RecruiterChatPanel({ candidate, onOpenCandidate }: RecruiterChatPanelProps) {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const addMessage = useChatStore((state) => state.addMessage);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const addBotMessage = useChatStore((state) => state.addBotMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const mode = useSearchStore((state) => state.mode);
  const limit = useSearchStore((state) => state.limit);
  const weights = useSearchStore((state) => state.weights);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({ role: 'assistant', content: 'I can help summarize candidates and answer recruiting questions about the search results.' });
    }
  }, [addMessage, messages.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
    }
  }, [draft]);

  const canSubmit = useMemo(() => draft.trim().length > 0 && !isTyping, [draft, isTyping]);

  const sendMessage = async (content?: string) => {
    const trimmed = (content ?? draft).trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setDraft('');
    setTyping(true);

    try {
      const response = await searchResumes({
        query: trimmed,
        mode,
        limit,
        weights,
      });

      addBotMessage(
        <ResultsList
          results={response.results}
          searchType={mode}
          duration={response.duration}
          query={trimmed}
          onOpenCandidate={onOpenCandidate}
        />,
      );
    } catch (error) {
      addBotMessage(error instanceof Error ? error.message : 'Unable to search right now.');
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-white/[0.07] bg-bg-card p-6 shadow-lg shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Recruiter Chat</h2>
          <p className="mt-1 text-sm text-text-muted">Ask for quick summaries and candidate insights.</p>
        </div>
        <button
          type="button"
          onClick={() => clearMessages()}
          className="rounded-full border border-white/[0.07] px-3 py-1 text-sm text-text-muted transition hover:border-indigo-400/20 hover:text-text-primary"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-white/[0.07] bg-bg-surface p-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.07] p-4 text-sm text-text-muted">
            Start a conversation with the recruiter assistant.
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={message.role === 'assistant' ? 'text-text-muted' : 'text-text-primary'}>
            <div className="mb-1 text-xs uppercase tracking-wide text-text-muted">
              {message.role === 'assistant' ? 'assistant' : 'you'}
            </div>
            <div className="rounded-xl bg-bg-card px-3 py-2 text-sm leading-6">{message.content}</div>
          </div>
        ))}

        {isTyping ? (
          <div className="rounded-xl bg-bg-card px-3 py-2 text-sm text-text-muted">
            Thinking<span className="ml-1 animate-pulse">…</span>
          </div>
        ) : null}
      </div>

      {messages.length <= 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestionPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="rounded-full border border-white/[0.07] bg-bg-surface px-3 py-1.5 text-sm text-text-muted transition hover:border-indigo-400/20 hover:text-text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="min-h-[56px] flex-1 resize-none rounded-xl border border-white/[0.07] bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none"
          placeholder="Ask the recruiter assistant..."
        />
        <button
          onClick={() => void sendMessage()}
          disabled={!canSubmit}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTyping ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
