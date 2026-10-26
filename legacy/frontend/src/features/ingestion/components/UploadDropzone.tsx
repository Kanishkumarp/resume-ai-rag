import React, { useCallback, useState } from 'react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void | Promise<void>;
  isUploading: boolean;
  error: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
}

export function UploadDropzone({ onFileSelect, isUploading, error, status }: UploadDropzoneProps) {
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
      className={`rounded-xl border border-white/[0.07] bg-bg-card p-6 text-center transition ${
        isDragActive ? 'border-indigo-400/40 bg-indigo-500/10' : ''
      } ${isUploading ? 'opacity-70' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
    >
      <input id="resume-upload-input" type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleInputChange} />
      <label htmlFor="resume-upload-input" className="flex cursor-pointer flex-col items-center gap-3">
        <div className="rounded-full border border-white/[0.07] bg-bg-surface px-4 py-2 text-sm font-medium text-text-primary">
          {status === 'success' ? 'Upload another PDF' : 'Drop PDF here or click to browse'}
        </div>
        <p className="text-sm text-text-muted">
          {status === 'error' ? 'Please choose a valid PDF under 5MB and try again.' : 'Only PDF files up to 5MB are supported.'}
        </p>
      </label>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
