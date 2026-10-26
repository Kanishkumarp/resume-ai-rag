export function ResultCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-indigo-500/20" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
