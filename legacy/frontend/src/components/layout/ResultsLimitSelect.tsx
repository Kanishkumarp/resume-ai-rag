import { useSearchStore } from '../../lib/stores/search.store';

export function ResultsLimitSelect() {
  const limit = useSearchStore((state) => state.limit);
  const setLimit = useSearchStore((state) => state.setLimit);

  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Results window</span>
      <select
        value={limit}
        onChange={(event) => setLimit(Number(event.target.value))}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
      >
        <option value={3}>3 results</option>
        <option value={5}>5 results</option>
        <option value={10}>10 results</option>
        <option value={20}>20 results</option>
      </select>
    </label>
  );
}
