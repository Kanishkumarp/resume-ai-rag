import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="dragon-fire-shell min-h-screen overflow-x-hidden text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
        {children}
      </div>
    </div>
  );
}
