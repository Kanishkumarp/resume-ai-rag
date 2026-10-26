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
    <div className="flex flex-wrap gap-2 px-4 pb-3" aria-label="Suggested candidate searches">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion.replace(/ \([^)]*\)$/, ''))}
          className="suggestion-chip rounded-full px-2.5 py-1 text-xs transition"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
