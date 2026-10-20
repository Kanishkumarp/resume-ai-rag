interface CandidateProfileCardProps {
  candidate?: {
    name?: string;
    title?: string;
    summary?: string;
    skills?: string[];
    experienceYears?: number;
    location?: string;
  };
}

export function CandidateProfileCard({ candidate }: CandidateProfileCardProps) {
  if (!candidate) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-bg-card p-6 text-sm text-text-muted">
        Select a candidate to view their resume details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg-card p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Candidate profile</p>
          <h3 className="mt-1 text-xl font-semibold text-text-primary">{candidate.name}</h3>
          <p className="mt-1 text-sm text-text-muted">{candidate.title}</p>
        </div>
        <div className="rounded-full border border-white/[0.07] bg-bg-surface px-3 py-2 text-sm text-text-muted">
          {candidate.experienceYears === undefined ? 'Experience not listed' : `${candidate.experienceYears} years experience`}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/[0.07] bg-bg-surface p-4">
        <p className="text-sm text-text-muted">{candidate.summary ?? 'No resume summary is available.'}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Skills</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills?.map((skill) => (
              <span key={skill} className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Location</h4>
          <p className="mt-2 text-sm text-text-muted">{candidate.location ?? 'Location not listed'}</p>
        </div>
      </div>
    </div>
  );
}
