interface EducationSectionProps {
  education?: Array<{ degree: string; institution: string; year?: string }>;
}

export function EducationSection({ education = [] }: EducationSectionProps) {
  if (!education.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Education</p>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        {education.map((item) => (
          <div key={`${item.degree}-${item.institution}`}>
            <p className="font-medium text-white">{item.degree}</p>
            <p className="text-slate-400">{item.institution} {item.year ? `• ${item.year}` : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
