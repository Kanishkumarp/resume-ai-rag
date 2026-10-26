import { useEffect, useRef } from 'react';
import { useChatStore } from '../../../lib/stores/chat.store';
import { BotBubble } from './BotBubble';
import { UserBubble } from './UserBubble';
import { WelcomeMessage } from './WelcomeMessage';
import { LoadingDots } from '../../common/LoadingDots';
import { ResultCardSkeleton } from '../../common/ResultCardSkeleton';

export function ChatMessages() {
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
    >
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'assistant' ? 'text-left' : 'text-right'
            }
          >
            {message.role === 'assistant' ? (
              <BotBubble>{message.content}</BotBubble>
            ) : (
              <UserBubble>{message.content}</UserBubble>
            )}
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
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Preparing result cards
            </p>
            <ResultCardSkeleton />
          </div>
        </>
      ) : null}
    </div>
  );
}
