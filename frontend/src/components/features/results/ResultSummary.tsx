interface ResultSummaryProps {
  count: number;
  mode: string;
}

export function ResultSummary({ count, mode }: ResultSummaryProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
      <span>{count} candidate{count === 1 ? '' : 's'} found</span>
      <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-indigo-200">{mode}</span>
    </div>
  );
}
