import type { ReactNode } from 'react';

export type MessageRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: ReactNode;
};
