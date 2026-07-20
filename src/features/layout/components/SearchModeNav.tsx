interface SearchModeNavProps {
  activeMode: 'vector' | 'bm25' | 'hybrid';
  onChange: (mode: 'vector' | 'bm25' | 'hybrid') => void;
}

const modes = [
  { value: 'vector' as const, label: 'Vector Search', description: 'Semantic similarity' },
  { value: 'bm25' as const, label: 'BM25 Keyword', description: 'Exact term relevance' },
  { value: 'hybrid' as const, label: 'Hybrid', description: 'Balanced ranking' },
];

export function SearchModeNav({ activeMode, onChange }: SearchModeNavProps) {
  return (
    <div className="space-y-2">
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              isActive
                ? 'border-indigo-400/30 bg-indigo-500/10 text-text-primary'
                : 'border-white/[0.07] bg-bg-surface text-text-muted hover:border-indigo-400/20 hover:text-text-primary'
            }`}
          >
            <div className="font-medium">{mode.label}</div>
            <div className="mt-1 text-xs opacity-80">{mode.description}</div>
          </button>
        );
      })}
    </div>
  );
}
