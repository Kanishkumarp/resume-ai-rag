interface SkillsSectionProps {
  skills?: string[];
}

export function SkillsSection({ skills = [] }: SkillsSectionProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Skills</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
