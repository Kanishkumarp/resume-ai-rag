import { Link } from 'react-router-dom';
import { ResumeUploadCard } from '../components/ResumeUploadCard';
import {
  ArrowLeft,
  BadgeCheck,
  FileSearch,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';

export function IngestionPage() {
  return (
    <div className="dragon-fire-shell min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/[0.08] text-red-300">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">RecruitBot</p>
              <p className="text-[10px] text-slate-500">Resume intelligence</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-red-400/25 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to search
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:gap-16">
          <section className="mx-auto max-w-xl lg:mx-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-red-400/15 bg-red-500/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200">
              <FileSearch size={13} /> Resume library
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Bring your talent pool into focus.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
              Add PDF resumes to your workspace. RecruitBot processes each
              document so you can discover relevant experience with keyword,
              semantic, or hybrid search.
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  Icon: BadgeCheck,
                  title: 'Search-ready profiles',
                  copy: 'Parsed resume content is indexed for candidate discovery.',
                },
                {
                  Icon: LockKeyhole,
                  title: 'Private workspace access',
                  copy: 'Uploads are available through your configured API access.',
                },
              ].map(({ Icon, title, copy }) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-red-200">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="mx-auto w-full max-w-xl">
            <ResumeUploadCard />
          </section>
        </main>
        <footer className="border-t border-white/[0.06] py-4 text-center text-[11px] text-slate-600">
          PDF only · 5 MB maximum file size
        </footer>
      </div>
    </div>
  );
}
