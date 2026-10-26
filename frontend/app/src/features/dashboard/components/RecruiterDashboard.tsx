import { CandidateSearchPanel } from '../../search/components/CandidateSearchPanel';
import { RecruiterChatPanel } from '../../chat/components/RecruiterChatPanel';
import { ResumeUploadCard } from '../../ingestion/components/ResumeUploadCard';
import { Sidebar } from '../../layout/components/Sidebar';
import { CandidateDetailModal } from '../../candidate/components/CandidateDetailModal';
import { useCandidateModal } from '../../../hooks/use-candidate-modal';

export function RecruiterDashboard() {
  const { candidate: selectedCandidate, open: isModalOpen, openModal, close, error } = useCandidateModal();
  const summary = 'Upload a resume to add it to the searchable library.';

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-8 text-text-primary">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-white/[0.07] bg-bg-card p-6 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">RecruitBot</p>
              <h1 className="text-3xl font-semibold">Resume intelligence workspace</h1>
              <p className="mt-2 max-w-2xl text-sm text-text-muted">
                Ingest resumes, search candidates, and summarize fit with a unified recruiter experience.
              </p>
            </div>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Connected to search pipeline
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3 text-sm text-indigo-200">{summary}</div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar />
          <div className="space-y-6">
            <ResumeUploadCard />
            <CandidateSearchPanel />
            <RecruiterChatPanel onOpenCandidate={openModal} />
          </div>
        </div>
      </div>
      <CandidateDetailModal isOpen={isModalOpen} onClose={close} candidate={selectedCandidate ?? undefined} loading={false} error={error} />
    </div>
  );
}
