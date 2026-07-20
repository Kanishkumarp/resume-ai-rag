import { Trash2 } from 'lucide-react';
import { useChatStore } from '../../lib/stores/chat.store';

export function ClearChatButton() {
  const clearMessages = useChatStore((state) => state.clearMessages);

  return (
    <button
      type="button"
      onClick={() => clearMessages()}
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 transition hover:border-indigo-400/20 hover:text-white"
    >
      <Trash2 className="h-4 w-4" />
      Clear chat
    </button>
  );
}
