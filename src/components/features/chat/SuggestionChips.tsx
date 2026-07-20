import { useSearchStore } from '../../../lib/stores/search.store';

interface SuggestionChipsProps {
  onSelect: (value: string) => void;
}

const baseSuggestions = [
  'Backend engineer with Python and AWS',
  'Senior frontend engineer with React and TypeScript',
  'Machine learning engineer with NLP experience',
  'Lead QA engineer with Playwright and CI/CD',
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  const mode = useSearchStore((state) => state.mode);
  const modeLabel = mode === 'bm25' ? 'keyword' : mode === 'vector' ? 'semantic' : 'hybrid';

  const suggestions = baseSuggestions.map((suggestion, index) =>
    index === 0 ? `${suggestion} (${modeLabel})` : suggestion,
  );

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion.replace(/ \([^)]*\)$/, ''))}
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:border-indigo-400/20 hover:text-white"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
