import { useMemo, useState } from 'react';
import { chatStore, type ChatMessage } from '../lib/stores/chat.store';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => chatStore.getMessages());
  const [loading, setLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    chatStore.addMessage(message);
    setMessages(chatStore.getMessages());
  };

  const clear = () => {
    chatStore.clear();
    setMessages([]);
  };

  return useMemo(() => ({ messages, loading, setLoading, addMessage, clear }), [messages, loading]);
}
