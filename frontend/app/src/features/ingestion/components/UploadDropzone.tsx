import React, { useCallback, useState } from 'react';
import { FileUp } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void | Promise<void>;
  isUploading: boolean;
  error: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  compact?: boolean;
}

export function UploadDropzone({
  onFileSelect,
  isUploading,
  error,
  status,
  compact = false,
}: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void onFileSelect(file);
    }
  };

  return (
    <div
      className={`${compact ? 'rounded-xl p-3' : 'rounded-xl p-6'} border border-dashed border-white/[0.12] bg-black/20 text-center transition ${
        isDragActive
          ? 'border-red-400/40 bg-red-500/[0.06]'
          : 'hover:border-white/20'
      } ${isUploading ? 'opacity-70' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        id="resume-upload-input"
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleInputChange}
      />
      <label
        htmlFor="resume-upload-input"
        className={`flex cursor-pointer items-center ${compact ? 'gap-2.5 text-left' : 'flex-col gap-3'}`}
      >
        {compact ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
            <FileUp size={15} />
          </span>
        ) : null}
        <span className="min-w-0">
          <span
            className={`block font-medium text-text-primary ${compact ? 'text-[11px]' : 'rounded-full border border-white/[0.07] bg-bg-surface px-4 py-2 text-sm'}`}
          >
            {status === 'success'
              ? 'Upload another PDF'
              : compact
                ? 'Choose a resume'
                : 'Drop PDF here or click to browse'}
          </span>
          <span className="mt-1 block text-[10px] leading-4 text-text-muted">
            {status === 'error'
              ? 'Choose a valid PDF under 5MB.'
              : compact
                ? 'or drag and drop here'
                : 'Only PDF files up to 5MB are supported.'}
          </span>
        </span>
      </label>
      {error ? <p className="mt-3 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
