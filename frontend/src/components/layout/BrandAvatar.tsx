import { StatusDot } from './StatusDot';

export function BrandAvatar() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-950/40">
        <span className="text-lg font-semibold text-white">R</span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">RecruitBot</p>
          <StatusDot />
        </div>
        <p className="text-xs text-slate-400">Online</p>
      </div>
    </div>
  );
}
