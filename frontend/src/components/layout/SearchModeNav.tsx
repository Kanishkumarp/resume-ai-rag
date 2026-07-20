import type { SearchMode } from '../../types/search.types';

interface SearchModeNavProps {
  activeMode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const options: Array<{ value: SearchMode; label: string; description: string }> = [
  { value: 'vector', label: 'Vector Search', description: 'Semantic similarity' },
  { value: 'bm25', label: 'BM25 Keyword', description: 'Exact term relevance' },
  { value: 'hybrid', label: 'Hybrid', description: 'Balanced ranking' },
];

export function SearchModeNav({ activeMode, onChange }: SearchModeNavProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const active = option.value === activeMode;
        const accent = option.value === 'bm25' ? 'from-pink-500/20 to-transparent' : option.value === 'vector' ? 'from-indigo-500/20 to-transparent' : 'from-emerald-500/20 to-transparent';

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative w-full overflow-hidden rounded-2xl border p-3 text-left transition ${active ? 'border-indigo-400/40 bg-indigo-500/10 text-white' : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-indigo-400/20 hover:text-white'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${accent}`} />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-semibold">{option.label}</span>
              {active ? <span className="text-xs text-indigo-300">Active</span> : null}
            </div>
            <p className="relative mt-1 text-xs text-slate-400">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
