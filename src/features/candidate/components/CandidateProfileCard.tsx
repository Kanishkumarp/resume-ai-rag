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
  const profile = candidate ?? {
    name: 'Sample Candidate',
    title: 'Senior Backend Engineer',
    summary: 'Strong background in distributed systems, API design, and cloud-native development.',
    skills: ['Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    experienceYears: 7,
    location: 'Remote • US',
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg-card p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Candidate profile</p>
          <h3 className="mt-1 text-xl font-semibold text-text-primary">{profile.name}</h3>
          <p className="mt-1 text-sm text-text-muted">{profile.title}</p>
        </div>
        <div className="rounded-full border border-white/[0.07] bg-bg-surface px-3 py-2 text-sm text-text-muted">
          {profile.experienceYears} years experience
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/[0.07] bg-bg-surface p-4">
        <p className="text-sm text-text-muted">{profile.summary}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Skills</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills?.map((skill) => (
              <span key={skill} className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Location</h4>
          <p className="mt-2 text-sm text-text-muted">{profile.location}</p>
        </div>
      </div>
    </div>
  );
}
