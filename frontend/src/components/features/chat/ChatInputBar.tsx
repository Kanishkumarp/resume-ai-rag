import { useEffect, useRef } from 'react';
import { useSearchStore } from '../../../lib/stores/search.store';

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInputBar({ value, onChange, onSubmit, disabled = false }: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mode = useSearchStore((state) => state.mode);
  const modeHint = mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid';

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-slate-950/80 p-2">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">
            <span>Recruit query</span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-300">{modeHint}</span>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Try: backend engineer with Python and AWS"
            className="min-h-[48px] flex-1 resize-none bg-transparent px-1 py-1 text-sm text-white outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </div>
      <p className="mt-2 px-1 text-xs text-slate-500">Press Enter to run a search • Shift+Enter for a new line</p>
    </div>
  );
}
