import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="workspace-frame">{children}</div>
    </div>
  );
}
