import { useSearchStore } from '../../lib/stores/search.store';

export function ResultsLimitSelect() {
  const limit = useSearchStore((state) => state.limit);
  const setLimit = useSearchStore((state) => state.setLimit);

  return (
    <label className="block text-sm text-slate-300">
      <span className="sr-only">Results window</span>
      <select
        value={limit}
        onChange={(event) => setLimit(Number(event.target.value))}
        className="w-full rounded-xl border border-white/[0.09] bg-[#141413] px-3 py-2.5 text-xs text-white outline-none transition focus:border-red-400/30"
      >
        <option value={3}>3 results</option>
        <option value={5}>5 results</option>
        <option value={10}>10 results</option>
        <option value={20}>20 results</option>
      </select>
    </label>
  );
}
