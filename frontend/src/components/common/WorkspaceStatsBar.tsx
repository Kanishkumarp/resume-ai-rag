import { useEffect, useState } from 'react';
import { useSearchStore } from '../../lib/stores/search.store';
import { getWorkspaceStats } from '../../lib/api/workspace.api';

interface WorkspaceStats {
  totalCandidates: number;
  lastIngestionAt: string | null;
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'No ingestion yet';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unavailable';
  }

  return parsed.toLocaleString();
}

export function WorkspaceStatsBar() {
  const mode = useSearchStore((state) => state.mode);
  const [stats, setStats] = useState<WorkspaceStats>({ totalCandidates: 0, lastIngestionAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        const nextStats = await getWorkspaceStats();
        if (active) {
          setStats(nextStats);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  const modeLabel = mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid';

  return (
    <div className="console-card rounded-3xl border border-white/10 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Workspace overview</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1">{loading ? 'Loading…' : `${stats.totalCandidates} candidates`}</span>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1">Last ingest: {loading ? '—' : formatTimestamp(stats.lastIngestionAt)}</span>
            <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-indigo-300">Mode: {modeLabel}</span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Live backend insight</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">RecruitBot</p>
        </div>
      </div>
    </div>
  );
}
