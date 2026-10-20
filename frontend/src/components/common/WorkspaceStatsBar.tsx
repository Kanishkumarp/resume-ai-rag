import { useEffect, useState } from 'react';
import { Clock3, UsersRound } from 'lucide-react';
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
    <div className="workspace-stats" aria-label="Workspace statistics">
      <article className="stat-card">
        <span className="stat-icon" aria-hidden="true"><UsersRound size={17} /></span>
        <div>
          <p className="stat-label">Resumes indexed</p>
          <p className="stat-value" aria-live="polite">{loading ? 'Loading…' : stats.totalCandidates.toLocaleString()}</p>
        </div>
      </article>
      <article className="stat-card">
        <span className="stat-icon" aria-hidden="true"><Clock3 size={17} /></span>
        <div>
          <p className="stat-label">Last ingestion</p>
          <p className="stat-value" title={stats.lastIngestionAt ?? undefined}>
            {loading ? 'Loading…' : formatTimestamp(stats.lastIngestionAt)}
          </p>
        </div>
      </article>
      <span className="sr-only">Current search mode: {modeLabel}</span>
    </div>
  );
}
