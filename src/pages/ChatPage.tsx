import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatMain } from '../components/features/chat/ChatMain';
import { WorkspaceStatsBar } from '../components/common/WorkspaceStatsBar';
import { CommandPalette } from '../components/common/CommandPalette';

export function ChatPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }

      if (event.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AppShell>
      <div className="flex flex-1 flex-col gap-4 py-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Workspace / Search / RecruitBot
              </div>
              <h1 className="text-xl font-semibold text-white">RecruitBot workspace</h1>
              <p className="mt-1 text-sm text-slate-400">Search uploaded resumes with BM25, vector, or hybrid retrieval.</p>
            </div>
          </div>
          <div className="mt-4">
            <WorkspaceStatsBar />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <Sidebar />
          <div className="flex min-w-0 flex-1 justify-center">
            <ChatMain />
          </div>
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </AppShell>
  );
}
