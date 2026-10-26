import { Trash2 } from 'lucide-react';
import { useChatStore } from '../../lib/stores/chat.store';

export function ClearChatButton() {
  const clearMessages = useChatStore((state) => state.clearMessages);

  return (
    <button
      type="button"
      onClick={() => clearMessages()}
      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-slate-400 transition hover:border-red-400/25 hover:text-white"
    >
      <Trash2 className="h-4 w-4" />
      Clear chat
    </button>
  );
}
