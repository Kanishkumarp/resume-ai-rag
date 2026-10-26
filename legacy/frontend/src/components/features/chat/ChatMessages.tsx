import { useEffect, useRef } from 'react';
import { useChatStore } from '../../../lib/stores/chat.store';
import { BotBubble } from './BotBubble';
import { UserBubble } from './UserBubble';
import { WelcomeMessage } from './WelcomeMessage';
import { EmptyState } from '../../common/EmptyState';
import { LoadingDots } from '../../common/LoadingDots';
import { ResultCardSkeleton } from '../../common/ResultCardSkeleton';

export function ChatMessages() {
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div ref={containerRef} className="chat-messages space-y-4" aria-live="polite" aria-relevant="additions text">
      {messages.length === 0 ? (
        <div className="space-y-3">
          <WelcomeMessage />
          <EmptyState title="Start with a recruiter prompt" description="Try a query such as backend engineer, product manager, or data engineer to retrieve ranked candidates." />
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={message.role === 'assistant' ? 'text-left' : 'text-right'}>
            {message.role === 'assistant' ? <BotBubble>{message.content}</BotBubble> : <UserBubble>{message.content}</UserBubble>}
          </div>
        ))
      )}
      {isTyping ? (
        <>
          <BotBubble>
            <div className="flex items-center gap-2">
              <LoadingDots />
              <span className="text-sm text-slate-400">Searching resumes…</span>
            </div>
          </BotBubble>
          <div className="mx-2 space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Preparing result cards</p>
            <ResultCardSkeleton />
          </div>
        </>
      ) : null}
    </div>
  );
}
