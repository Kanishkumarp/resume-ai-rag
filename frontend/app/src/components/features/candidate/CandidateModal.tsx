import { BadgeCheck, BriefcaseBusiness, FolderKanban, GraduationCap, Mail, MapPin, Phone, Sparkles, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useSearchStore } from '../../../lib/stores/search.store';
import { getScoreDisplayMeta } from '../../../lib/utils/searchScore';
import type { CandidateProfile } from '../../../../../../src/types/candidate.types';
import type { SearchMode } from '../../../../../../src/types/search.types';

interface CandidateModalProps {
  candidate?: CandidateProfile | null;
  open?: boolean;
  loading?: boolean;
  error?: string | null;
  mode?: SearchMode;
  onClose?: () => void;
}

type ModalCandidate = CandidateProfile & { score: number; bm25Score?: number; vectorScore?: number; hybridScore?: number };

function SectionHeader({ icon: Icon, title }: { icon: typeof BriefcaseBusiness; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-300">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

export function CandidateModal({ candidate, open = false, loading = false, error, mode, onClose }: CandidateModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const activeMode = useSearchStore((state) => state.mode);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  if (loading || !candidate) {
    if (error) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-3 py-3 sm:px-4" onClick={onClose}>
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white">Candidate profile unavailable</h2>
            <p role="alert" className="mt-3 text-sm text-slate-300">{error}</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-3 py-3 sm:px-4" onClick={onClose}>
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 outline-none"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Candidate profile</p>
              <div className="mt-2 h-6 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="mt-2 h-4 w-56 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
              </div>
              <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const modalCandidate: ModalCandidate = { ...candidate, score: candidate.matchScore ?? 0 };
  const resolvedMode = mode ?? activeMode ?? (modalCandidate.hybridScore !== undefined && (modalCandidate.bm25Score !== undefined || modalCandidate.vectorScore !== undefined)
    ? 'hybrid'
    : modalCandidate.vectorScore !== undefined ? 'vector' : modalCandidate.bm25Score !== undefined ? 'bm25' : undefined);
  const scoreMeta = getScoreDisplayMeta(modalCandidate, resolvedMode);
  const showBreakdown = resolvedMode === 'hybrid';
  const scoreLabel = scoreMeta.label;
  const breakdownLabel = scoreMeta.label;
  const visibleScore = scoreMeta.value;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-3 py-3 sm:px-4" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Candidate profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{candidate.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{candidate.title ?? candidate.company ?? 'Resume preview'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-950/70 to-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Profile summary</p>
                    <p className="mt-2 text-sm text-slate-300">{candidate.summary ?? 'Profile details are being prepared for review.'}</p>
                  </div>
                  <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
                    <span className="mr-1 inline-flex items-center"><Sparkles className="h-3.5 w-3.5" /></span>
                    {candidate.title ? 'Match ready' : 'Profile ready'}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  {visibleScore !== undefined ? <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{scoreLabel} {visibleScore.toFixed(3)}</span> : null}
                  {candidate.source ? <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-indigo-300">{candidate.source}</span> : null}
                  {candidate.experienceYears !== undefined ? <span className="rounded-full border border-white/10 px-2.5 py-1">{candidate.experienceYears} yrs</span> : null}
                </div>
                {showBreakdown ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="rounded-full border border-white/10 px-2.5 py-1">
                      {breakdownLabel} {visibleScore.toFixed(3)} • BM25 {modalCandidate.bm25Score?.toFixed(3)} • Vector {modalCandidate.vectorScore?.toFixed(3)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <SectionHeader icon={Mail} title="Contact" />
                  <div className="space-y-2 text-sm text-slate-300">
                    {candidate.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-300" />
                        <span className="break-all">{candidate.email}</span>
                      </div>
                    ) : null}
                    {candidate.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-300" />
                        <span>{candidate.phone}</span>
                      </div>
                    ) : null}
                    {candidate.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-300" />
                        <span>{candidate.location}</span>
                      </div>
                    ) : null}
                    {!candidate.email && !candidate.phone && !candidate.location ? (
                      <p className="text-slate-400">Contact details are not available yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <SectionHeader icon={BriefcaseBusiness} title="Skills" />
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills ?? []).length > 0 ? (
                      (candidate.skills ?? []).map((skill) => (
                        <span key={skill} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{skill}</span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No skills available yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {(candidate.experience?.length ?? 0) > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <SectionHeader icon={BriefcaseBusiness} title="Experience" />
                  <div className="space-y-3 border-l border-white/10 pl-4 text-sm text-slate-300">
                    {candidate.experience?.map((item) => (
                      <div key={`${item.role}-${item.company}`} className="relative">
                        <div className="absolute -left-[1.1rem] top-1 h-2.5 w-2.5 rounded-full bg-indigo-400" />
                        <p className="font-medium text-white">{item.role} • {item.company}</p>
                        {item.duration ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.duration}</p> : null}
                        {item.description ? <p className="mt-2 text-slate-400">{item.description}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-2">
                {(candidate.education?.length ?? 0) > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <SectionHeader icon={GraduationCap} title="Education" />
                    <div className="space-y-3 text-sm text-slate-300">
                      {candidate.education?.map((item) => (
                        <div key={`${item.degree}-${item.institution}`}>
                          <p className="font-medium text-white">{item.degree}</p>
                          <p className="mt-1 text-slate-400">{item.institution}</p>
                          {item.year ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.year}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(candidate.projects?.length ?? 0) > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <SectionHeader icon={FolderKanban} title="Projects" />
                    <div className="space-y-3 text-sm text-slate-300">
                      {candidate.projects?.map((project) => (
                        <div key={project.title}>
                          <p className="font-medium text-white">{project.title}</p>
                          {project.description ? <p className="mt-1 text-slate-400">{project.description}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {(candidate.certifications?.length ?? 0) > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <SectionHeader icon={BadgeCheck} title="Certifications" />
                  <div className="flex flex-wrap gap-2">
                    {candidate.certifications?.map((certification) => (
                      <span key={certification} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{certification}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
