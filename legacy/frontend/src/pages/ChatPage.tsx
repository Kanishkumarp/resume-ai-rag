import { useEffect, useState } from 'react';
import { ChevronRight, Command, Menu, Search, X } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatMain } from '../components/features/chat/ChatMain';
import { WorkspaceStatsBar } from '../components/common/WorkspaceStatsBar';
import { CommandPalette } from '../components/common/CommandPalette';

export function ChatPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }

      if (event.key === 'Escape') {
        setCommandPaletteOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AppShell>
      <header className="workspace-header">
        <div className="workspace-brand">
          <span className="brand-mark" aria-hidden="true"><Search size={19} /></span>
          <span>
            <span className="brand-title">Resume AI RAG</span>
            <span className="brand-caption block">AI-powered talent search</span>
          </span>
        </div>
        <div className="workspace-breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>Candidate search</strong>
          <span className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500">
            <Command size={12} /> K
          </span>
        </div>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={sidebarOpen ? 'Close search settings' : 'Open search settings'}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <section className="workspace-intro" aria-labelledby="page-title">
        <div>
          <p className="sidebar-section-label mb-2">SEARCH WORKSPACE</p>
          <h1 id="page-title" className="workspace-heading">Find the right talent, faster.</h1>
          <p className="workspace-description">
            Search your resume library using natural language, keyword matching, or a blend of both.
          </p>
        </div>
        <WorkspaceStatsBar />
      </section>

      <div className="workspace-layout">
        <button
          type="button"
          aria-label="Close search settings"
          className={`mobile-sidebar-backdrop${sidebarOpen ? ' is-open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          tabIndex={sidebarOpen ? 0 : -1}
        />
        <aside className={`app-sidebar${sidebarOpen ? ' is-open' : ''}`} aria-label="Search settings">
          <Sidebar />
        </aside>
        <main className="workspace-main">
          <ChatMain />
          <p className="mt-3 text-center text-xs text-slate-400">
            Search combines semantic understanding with your selected retrieval mode.
          </p>
        </main>
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </AppShell>
  );
}
