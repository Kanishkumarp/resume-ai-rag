interface ExperienceSectionProps {
  experience?: Array<{ role: string; company: string; years?: number; description?: string }>;
}

export function ExperienceSection({ experience = [] }: ExperienceSectionProps) {
  if (!experience.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Experience</p>
      <div className="mt-3 space-y-3 text-sm text-slate-300">
        {experience.map((item) => (
          <div key={`${item.role}-${item.company}`}>
            <p className="font-medium text-white">{item.role}</p>
            <p className="text-slate-400">{item.company} • {item.years ?? 0} yrs</p>
            {item.description ? <p className="mt-1 text-slate-300">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
