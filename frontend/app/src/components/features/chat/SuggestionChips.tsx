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
  const modeLabel =
    mode === 'bm25' ? 'keyword' : mode === 'vector' ? 'semantic' : 'hybrid';

  const suggestions = baseSuggestions.map((suggestion, index) =>
    index === 0 ? `${suggestion} (${modeLabel})` : suggestion,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-wrap justify-center gap-2 px-4 pb-4">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion.replace(/ \([^)]*\)$/, ''))}
          className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-400 transition hover:border-red-400/25 hover:bg-red-500/[0.04] hover:text-white"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
