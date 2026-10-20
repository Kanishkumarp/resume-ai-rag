import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../../lib/stores/chat.store';
import { useSearchStore } from '../../lib/stores/search.store';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const clearMessages = useChatStore((state) => state.clearMessages);
  const setMode = useSearchStore((state) => state.setMode);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onClose();
      }

      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const actions = useMemo(() => [
    { label: 'Switch to BM25', action: () => setMode('bm25') },
    { label: 'Switch to Vector', action: () => setMode('vector') },
    { label: 'Switch to Hybrid', action: () => setMode('hybrid') },
    { label: 'Clear chat', action: () => clearMessages() },
  ], [clearMessages, setMode]);

  const filtered = actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) {
    return null;
  }

  return (
    <div className="command-backdrop fixed inset-0 z-[60] flex items-start justify-center px-3 pt-20" role="presentation">
      <div className="command-palette w-full max-w-xl rounded-3xl p-3" role="dialog" aria-modal="true" aria-label="Search commands">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands…"
          aria-label="Search commands"
          className="command-search w-full rounded-2xl px-3 py-3 text-sm outline-none"
        />
        <div className="mt-2 space-y-2">
          {filtered.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                action.action();
                onClose();
              }}
              className="command-action flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition"
            >
              <span>{action.label}</span>
              <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Run</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
