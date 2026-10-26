interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  );
}
