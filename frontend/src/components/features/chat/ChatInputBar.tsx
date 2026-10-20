import { useEffect, useRef } from 'react';
import { ArrowUp, Search } from 'lucide-react';
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
    <div className="chat-input-bar">
      <div className="query-composer">
        <label className="sr-only" htmlFor="resume-search-query">Describe the candidate you want to find</label>
        <div className="min-w-0 flex-1">
          <textarea
            id="resume-search-query"
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Describe the candidate you want to find"
            placeholder="e.g., Find Python developers with 3+ years of experience and FastAPI skills"
            className="query-textarea"
          />
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="query-submit"
        >
          <Search size={15} />
          <span>Search</span>
          <ArrowUp size={14} aria-hidden="true" />
        </button>
      </div>
      <p className="composer-hint">Press Enter to search · Shift+Enter for a new line · {modeHint} retrieval</p>
    </div>
  );
}
