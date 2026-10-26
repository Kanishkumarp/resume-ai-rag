import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatMain } from '../components/features/chat/ChatMain';
import { WorkspaceStatsBar } from '../components/common/WorkspaceStatsBar';
import { CommandPalette } from '../components/common/CommandPalette';
import { Flame, Settings2, Sparkles } from 'lucide-react';
import { MobileDrawer } from '../components/layout/MobileDrawer';

export function ChatPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <div className="flex flex-1 flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.09] text-red-300 shadow-lg shadow-red-950/20">
              <Flame size={22} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                RecruitBot · Talent intelligence
              </p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                Resume search workspace
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-xs font-medium text-slate-300">
              <Sparkles size={14} className="text-red-300" /> RAG-powered search
            </div>
            <button
              type="button"
              aria-label="Open search settings"
              aria-expanded={settingsOpen}
              aria-controls="mobile-search-settings"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-200 transition hover:border-red-400/25 hover:text-white lg:hidden"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        <section aria-label="Workspace statistics">
          <WorkspaceStatsBar />
        </section>

        <div className="grid flex-1 grid-cols-1 items-start gap-5 lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <Sidebar />
          </aside>
          <main className="flex min-w-0 justify-center lg:min-h-0">
            <ChatMain />
          </main>
        </div>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-slate-600 sm:flex-row">
          <span>RecruitBot · Resume intelligence workspace</span>
          <span>Keyword, semantic, and hybrid retrieval</span>
        </footer>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <MobileDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <Sidebar />
      </MobileDrawer>
    </AppShell>
  );
}
