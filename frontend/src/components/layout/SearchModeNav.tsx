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

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`search-mode-option ${active ? 'is-active' : ''}`}
          >
            <div className="search-mode-title">
              <span>{option.label}</span>
              {active ? <span className="search-mode-active">Active</span> : null}
            </div>
            <p className="search-mode-description">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
