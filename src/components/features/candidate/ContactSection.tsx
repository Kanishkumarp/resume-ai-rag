interface ContactSectionProps {
  email?: string;
  phone?: string;
  location?: string;
}

export function ContactSection({ email, phone, location }: ContactSectionProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-white">Contact</p>
      <div className="mt-2 space-y-1 text-sm text-slate-300">
        {email ? <p>{email}</p> : null}
        {phone ? <p>{phone}</p> : null}
        {location ? <p>{location}</p> : null}
      </div>
    </div>
  );
}
