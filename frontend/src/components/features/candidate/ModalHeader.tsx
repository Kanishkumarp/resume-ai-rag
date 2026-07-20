interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Candidate profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
          Close
        </button>
      ) : null}
    </div>
  );
}
