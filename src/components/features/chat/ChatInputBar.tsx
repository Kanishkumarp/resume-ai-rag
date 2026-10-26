import { useEffect, useRef } from 'react';
import { useSearchStore } from '../../../lib/stores/search.store';
import { ArrowUp, Sparkles } from 'lucide-react';

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mode = useSearchStore((state) => state.mode);
  const modeHint =
    mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid';

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
    <div className="border-t border-white/[0.08] bg-black/10 p-4 sm:p-5">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.11] bg-[#111110] p-2 shadow-xl shadow-black/20 transition focus-within:border-red-400/30 focus-within:shadow-red-950/20">
          <div className="min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Recruiter search query"
              placeholder="Describe the candidate you’re looking for…"
              className="block min-h-[42px] w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
            />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            aria-label="Search resumes"
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-700 px-4 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowUp size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} /> Powered by resume-aware retrieval
          </span>
          <span>
            <kbd className="rounded border border-white/10 px-1 py-0.5 font-sans">
              Enter
            </kbd>{' '}
            to search ·{' '}
            <kbd className="rounded border border-white/10 px-1 py-0.5 font-sans">
              Shift + Enter
            </kbd>{' '}
            for a new line
          </span>
        </div>
      </div>
    </div>
  );
}
