import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, BriefcaseBusiness, GraduationCap, Mail, MapPin, Phone, FolderKanban, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { CandidateProfile } from '../../../types/candidate.types';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: CandidateProfile | null;
  loading?: boolean;
}

function SectionHeader({ icon: Icon, title }: { icon: typeof BriefcaseBusiness; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-300">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
    </div>
  );
}

export function CandidateDetailModal({ isOpen, onClose, candidate, loading = false }: CandidateDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const profile = candidate ?? {
    id: 'sample-candidate',
    name: 'Sample Candidate',
    title: 'Senior Backend Engineer',
    company: 'Northwind Labs',
    summary: 'Experienced in scalable backend systems, API integration, and full-stack delivery.',
    skills: ['Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    email: 'candidate@example.com',
    phone: '+1 (555) 010-0000',
    location: 'Remote • United States',
    experience: [
      {
        role: 'Senior Backend Engineer',
        company: 'Northwind Labs',
        duration: '2021 — Present',
        description: 'Led API modernization and platform reliability efforts across a distributed Node.js service layer.',
      },
    ],
    education: [{ degree: 'B.Sc. Computer Science', institution: 'University of Washington', year: '2018' }],
    projects: [{ title: 'Resume Intelligence Platform', description: 'Built ingestion, search, and summarization workflows for recruiter-facing experiences.' }],
    certifications: ['AWS Certified Developer', 'MongoDB Associate'],
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Candidate profile"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-bg-card shadow-2xl shadow-black/40"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Candidate profile</p>
                <h3 className="mt-1 text-2xl font-semibold text-text-primary">{profile.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{profile.title ?? 'Open profile'}{profile.company ? ` • ${profile.company}` : ''}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/[0.07] bg-bg-surface p-2 text-text-muted transition hover:text-text-primary"
                aria-label="Close candidate profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                  <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
                  <div className="h-20 animate-pulse rounded-xl bg-white/10" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-24 animate-pulse rounded-xl bg-white/10" />
                    <div className="h-24 animate-pulse rounded-xl bg-white/10" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4 text-sm text-text-muted">
                    {profile.summary ?? 'A detailed profile will appear here once the candidate record is available.'}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                      <SectionHeader icon={Mail} title="Contact" />
                      <div className="space-y-2 text-sm text-text-muted">
                        {profile.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-indigo-300" />
                            <span>{profile.email}</span>
                          </div>
                        ) : null}
                        {profile.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-indigo-300" />
                            <span>{profile.phone}</span>
                          </div>
                        ) : null}
                        {profile.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-300" />
                            <span>{profile.location}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                      <SectionHeader icon={BadgeCheck} title="Skills" />
                      <div className="flex flex-wrap gap-2">
                        {profile.skills?.length ? (
                          profile.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-text-muted">No skills listed yet.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                    <SectionHeader icon={BriefcaseBusiness} title="Experience" />
                    {profile.experience?.length ? (
                      <ol className="space-y-3 border-l border-white/[0.07] pl-4">
                        {profile.experience.map((item) => (
                          <li key={`${item.company}-${item.role}`} className="relative">
                            <div className="absolute -left-[1.1rem] top-1 h-2.5 w-2.5 rounded-full bg-indigo-400" />
                            <div className="text-sm font-medium text-text-primary">{item.role}</div>
                            <div className="text-sm text-text-muted">{item.company}</div>
                            {item.duration ? <div className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">{item.duration}</div> : null}
                            {item.description ? <p className="mt-2 text-sm text-text-muted">{item.description}</p> : null}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-text-muted">No experience details are available.</p>
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                      <SectionHeader icon={GraduationCap} title="Education" />
                      {profile.education?.length ? (
                        <div className="space-y-3">
                          {profile.education.map((item) => (
                            <div key={`${item.degree}-${item.institution}`}>
                              <div className="text-sm font-medium text-text-primary">{item.degree}</div>
                              <div className="text-sm text-text-muted">{item.institution}</div>
                              {item.year ? <div className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">{item.year}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">No education details are available.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                      <SectionHeader icon={FolderKanban} title="Projects" />
                      {profile.projects?.length ? (
                        <div className="space-y-3">
                          {profile.projects.map((project) => (
                            <div key={project.title}>
                              <div className="text-sm font-medium text-text-primary">{project.title}</div>
                              {project.description ? <p className="mt-1 text-sm text-text-muted">{project.description}</p> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">No project highlights are available.</p>
                      )}
                    </div>
                  </div>

                  {profile.certifications?.length ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-bg-surface p-4">
                      <SectionHeader icon={BadgeCheck} title="Certifications" />
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((certification) => (
                          <span key={certification} className="rounded-full border border-white/[0.07] px-2.5 py-1 text-xs text-text-muted">
                            {certification}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
