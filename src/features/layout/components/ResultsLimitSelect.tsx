interface ResultsLimitSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export function ResultsLimitSelect({ value, onChange }: ResultsLimitSelectProps) {
  return (
    <label className="block rounded-xl border border-white/[0.07] bg-bg-surface p-3 text-sm text-text-muted">
      <div className="mb-2 font-medium text-text-primary">Show top</div>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-white/[0.07] bg-bg-card px-3 py-2 text-text-primary"
      >
        <option value={3}>3 results</option>
        <option value={5}>5 results</option>
        <option value={10}>10 results</option>
        <option value={20}>20 results</option>
      </select>
    </label>
  );
}
