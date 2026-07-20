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
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/70 px-3 pt-20">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-black/50">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands…"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none"
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
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-indigo-400/20 hover:text-white"
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
