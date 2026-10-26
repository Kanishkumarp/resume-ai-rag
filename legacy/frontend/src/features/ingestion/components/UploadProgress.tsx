interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

export function UploadProgress({ progress, status, message }: UploadProgressProps) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
        <span>{message}</span>
        <span>{status === 'success' ? 'Done' : `${Math.round(progress)}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full rounded-full transition-all ${
            status === 'error' ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
          }`}
          style={{ width: `${Math.max(progress, 0)}%` }}
        />
      </div>
    </div>
  );
}
