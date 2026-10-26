import { Flame } from 'lucide-react';

export function BrandAvatar() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/[0.09] text-red-300">
        <Flame size={20} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight text-white">
          RecruitBot
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">Talent intelligence</p>
      </div>
    </div>
  );
}
