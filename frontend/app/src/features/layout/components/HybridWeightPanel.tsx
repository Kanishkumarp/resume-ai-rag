interface HybridWeightPanelProps {
  activeMode: 'vector' | 'bm25' | 'hybrid';
  bm25Weight: number;
  vectorWeight: number;
  onBm25Change: (value: number) => void;
  onVectorChange: (value: number) => void;
  onPresetChange?: (preset: 'balanced' | 'bm25' | 'vector') => void;
}

const presets = [
  { label: 'Balanced', value: 'balanced' as const },
  { label: 'BM25', value: 'bm25' as const },
  { label: 'Vector', value: 'vector' as const },
];

export function HybridWeightPanel({ activeMode, bm25Weight, vectorWeight, onBm25Change, onVectorChange, onPresetChange }: HybridWeightPanelProps) {
  if (activeMode !== 'hybrid') return null;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-3">
      <div className="mb-3 text-sm font-medium text-text-primary">Search Weights</div>
      <div className="mb-3 flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onPresetChange?.(preset.value)}
            className="rounded-full border border-white/[0.07] px-2.5 py-1 text-xs text-text-muted transition hover:border-indigo-400/20 hover:text-text-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <label className="mb-3 block text-sm text-text-muted">
        <div className="mb-1 flex items-center justify-between">
          <span>BM25</span>
          <span>{bm25Weight}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={bm25Weight}
          onChange={(event) => onBm25Change(Number(event.target.value))}
          className="w-full accent-indigo-400"
        />
      </label>
      <label className="block text-sm text-text-muted">
        <div className="mb-1 flex items-center justify-between">
          <span>Vector</span>
          <span>{vectorWeight}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={vectorWeight}
          onChange={(event) => onVectorChange(Number(event.target.value))}
          className="w-full accent-pink-400"
        />
      </label>
    </div>
  );
}
