interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  compact?: boolean;
}

export function UploadProgress({
  progress,
  status,
  message,
  compact = false,
}: UploadProgressProps) {
  return (
    <div
      className={
        compact ? '' : 'rounded-xl border border-white/[0.07] bg-bg-surface p-4'
      }
    >
      <div
        className={`${compact ? 'mb-1.5 text-[10px]' : 'mb-2 text-sm'} flex items-center justify-between text-text-muted`}
      >
        <span className="max-w-[210px] truncate">{message}</span>
        <span>
          {status === 'success' ? 'Done' : `${Math.round(progress)}%`}
        </span>
      </div>
      <div
        className={`${compact ? 'h-1' : 'h-2'} overflow-hidden rounded-full bg-white/[0.08]`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            status === 'error'
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-red-500 to-orange-400'
          }`}
          style={{ width: `${Math.max(progress, 0)}%` }}
        />
      </div>
    </div>
  );
}
