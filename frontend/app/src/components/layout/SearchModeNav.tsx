import type { SearchMode } from '../../../../../src/types/search.types';
import { BrainCircuit, Search, Sparkles } from 'lucide-react';

interface SearchModeNavProps {
  activeMode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const options: Array<{
  value: SearchMode;
  label: string;
  description: string;
}> = [
  {
    value: 'vector',
    label: 'Vector Search',
    description: 'Semantic similarity',
  },
  { value: 'bm25', label: 'BM25 Keyword', description: 'Exact term relevance' },
  { value: 'hybrid', label: 'Hybrid', description: 'Balanced ranking' },
];

export function SearchModeNav({ activeMode, onChange }: SearchModeNavProps) {
  return (
    <div className="space-y-1.5">
      {options.map((option) => {
        const active = option.value === activeMode;
        const Icon =
          option.value === 'bm25'
            ? Search
            : option.value === 'vector'
              ? BrainCircuit
              : Sparkles;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`relative w-full rounded-xl border p-3 text-left transition ${active ? 'border-red-400/20 bg-red-500/[0.07] text-white' : 'border-transparent bg-white/[0.02] text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-red-400/10 text-red-300' : 'bg-white/[0.04] text-slate-500'}`}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {option.description}
                </span>
              </span>
              {active ? (
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
