import { BrainCircuit } from 'lucide-react';
import { useSearchStore } from '../../../lib/stores/search.store';

export function ChatTopbar() {
  const mode = useSearchStore((state) => state.mode);

  const modeLabel = mode === 'bm25' ? 'BM25 keyword' : mode === 'vector' ? 'Vector semantic' : 'Hybrid search';

  return (
    <div className="chat-topbar">
      <div className="assistant-identity">
        <div className="assistant-mark" aria-hidden="true"><BrainCircuit size={18} /></div>
        <div>
          <p className="assistant-name">AI resume search</p>
          <p className="assistant-subtitle">{modeLabel} · Resume library</p>
        </div>
      </div>
      <span className="mode-chip"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />{mode === 'bm25' ? 'BM25' : mode === 'vector' ? 'Vector' : 'Hybrid'}</span>
    </div>
  );
}
