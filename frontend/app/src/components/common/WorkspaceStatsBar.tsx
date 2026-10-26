import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchStore } from '../../lib/stores/search.store';
import { getWorkspaceStats } from '../../lib/api/workspace.api';
import { AlertCircle, Clock3, FileText, Layers3, RotateCw } from 'lucide-react';

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
  const [stats, setStats] = useState<WorkspaceStats>({
    totalCandidates: 0,
    lastIngestionAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadStats = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    try {
      const nextStats = await getWorkspaceStats();
      if (requestId.current !== currentRequestId) return;
      setStats(nextStats);
      setError(null);
    } catch (loadError) {
      if (requestId.current !== currentRequestId) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Workspace statistics could not be loaded.',
      );
    } finally {
      if (requestId.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadStats();
    return () => {
      requestId.current += 1;
    };
  }, [loadStats]);

  const modeLabel =
    mode === 'bm25'
      ? 'BM25 keyword'
      : mode === 'vector'
        ? 'Vector semantic'
        : 'Hybrid retrieval';
  const metrics = [
    {
      label: 'Resume library',
      value: loading
        ? 'Loading…'
        : error
          ? 'Unavailable'
          : stats.totalCandidates.toLocaleString(),
      detail: 'candidate profiles',
      Icon: FileText,
      color: 'text-red-300',
    },
    {
      label: 'Last indexed',
      value: loading
        ? 'Loading…'
        : error
          ? 'Unavailable'
          : formatTimestamp(stats.lastIngestionAt),
      detail: 'most recent resume ingestion',
      Icon: Clock3,
      color: 'text-orange-300',
    },
    {
      label: 'Search strategy',
      value: modeLabel,
      detail: 'retrieval method selected',
      Icon: Layers3,
      color: 'text-amber-200',
    },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, detail, Icon, color }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3.5 rounded-2xl border border-white/[0.075] bg-[#10100f]/90 px-4 py-3.5 shadow-lg shadow-black/10"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] ${color}`}
            >
              <Icon size={17} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {label}
              </p>
              <p
                className="mt-1 truncate text-sm font-semibold text-white"
                title={value}
              >
                {value}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-slate-600">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-amber-500/[0.04] px-3.5 py-2.5"
        >
          <p className="flex min-w-0 items-center gap-2 text-xs text-amber-100/80">
            <AlertCircle size={14} className="shrink-0 text-amber-300" />
            <span className="truncate">
              Workspace statistics are temporarily unavailable.
            </span>
          </p>
          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RotateCw size={11} className={loading ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
