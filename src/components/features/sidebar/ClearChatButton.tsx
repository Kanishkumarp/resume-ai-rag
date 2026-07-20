import { useChatStore } from '../../../lib/stores/chat.store';

export function ClearChatButton() {
  const clearMessages = useChatStore((state) => state.clearMessages);

  return (
    <button
      type="button"
      onClick={() => clearMessages()}
      className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
    >
      Clear chat
    </button>
  );
}
