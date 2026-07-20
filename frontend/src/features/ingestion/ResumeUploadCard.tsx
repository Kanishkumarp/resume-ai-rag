import { useState } from 'react';
import { useIngestionStore } from './ingestion.store';

export const ResumeUploadCard = () => {
  const [file, setFile] = useState<File | null>(null);
  const { isUploading, error, lastUpload, uploadResume } = useIngestionStore();

  const handleSubmit = async () => {
    if (!file) return;
    await uploadResume(file);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Resume ingestion</h3>
      <p className="mt-1 text-sm text-slate-600">Upload a PDF resume to the backend ingestion pipeline.</p>

      <input
        type="file"
        accept="application/pdf"
        className="mt-4 block w-full text-sm text-slate-600"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? 'Uploading…' : 'Upload resume'}
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {lastUpload ? (
        <pre className="mt-3 overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(lastUpload, null, 2)}
        </pre>
      ) : null}
    </div>
  );
};
