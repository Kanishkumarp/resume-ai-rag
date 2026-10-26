import type { ReactNode } from 'react';
import { create } from 'zustand';
import type { ChatMessage, MessageRole } from '../../types/chat.types';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  addUserMessage: (content: ReactNode) => void;
  addBotMessage: (content: ReactNode) => void;
  replaceMessages: (messages: ChatMessage[]) => void;
  setTyping: (value: boolean) => void;
  clearMessages: () => void;
}

const createMessage = (role: MessageRole, content: ReactNode): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
});

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, createMessage(message.role, message.content)] })),
  addUserMessage: (content) => set((state) => ({ messages: [...state.messages, createMessage('user', content)] })),
  addBotMessage: (content) => set((state) => ({ messages: [...state.messages, createMessage('assistant', content)] })),
  replaceMessages: (messages) => set({ messages }),
  setTyping: (value) => set({ isTyping: value }),
  clearMessages: () => set({ messages: [] }),
}));

export const chatStore = {
  getMessages: () => useChatStore.getState().messages,
  addMessage: (message: Omit<ChatMessage, 'id'>) => useChatStore.getState().addMessage(message),
  clear: () => useChatStore.getState().clearMessages(),
};
