import { Link } from 'react-router-dom';
import { ResumeUploadCard } from '../components/ResumeUploadCard';

export function IngestionPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6">
        <div className="w-full max-w-xl text-center">
          <Link to="/" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-indigo-400/30 hover:text-white">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-white">Resume ingestion</h1>
          <p className="mt-2 text-sm text-slate-400">Upload a PDF resume to start the ingestion pipeline.</p>
        </div>

        <ResumeUploadCard />
      </div>
    </div>
  );
}
