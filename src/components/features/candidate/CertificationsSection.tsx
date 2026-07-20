interface CertificationsSectionProps {
  certifications?: string[];
}

export function CertificationsSection({ certifications = [] }: CertificationsSectionProps) {
  if (!certifications.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Certifications</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {certifications.map((certification) => (
          <span key={certification} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
            {certification}
          </span>
        ))}
      </div>
    </div>
  );
}
