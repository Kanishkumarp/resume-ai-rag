interface CandidateDetailPanelProps {
  candidate: {
    id: string;
    name: string;
    title?: string;
    score?: number;
    source?: string;
  } | null;
}

export function CandidateDetailPanel({ candidate }: CandidateDetailPanelProps) {
  if (!candidate) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg-card p-5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Active candidate</p>
          <h3 className="mt-1 text-lg font-semibold text-text-primary">{candidate.name}</h3>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Ready</div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{candidate.title ?? 'Selected candidate'}</h3>
          <p className="mt-1 text-sm text-text-muted">Resume enriched and ready for recruiter review.</p>
        </div>
        <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          Score {candidate.score?.toFixed(3) ?? '0.000'}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-text-muted md:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Signal</div>
          <div className="mt-1 font-medium text-text-primary">Strong fit for backend and platform roles</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Source</div>
          <div className="mt-1 font-medium text-text-primary">{candidate.source ?? 'Hybrid retrieval'}</div>
        </div>
      </div>
    </div>
  );
}
