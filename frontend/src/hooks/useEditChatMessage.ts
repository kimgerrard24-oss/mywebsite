// frontend/src/hooks/useEditChatMessage.ts

import { useState } from 'react';
import { editChatMessage } from '@/lib/api/chat-messages';
import type { ChatMessage } from '@/types/chat-message';

export function useEditChatMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEdit(params: {
    chatId: string;
    messageId: string;
    content: string;
  }): Promise<ChatMessage | null> {
    try {
      setLoading(true);
      setError(null);

      return await editChatMessage(params);
    } catch (e: any) {
      setError('Unable to edit message');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    submitEdit,
    loading,
    error,
  };
}
