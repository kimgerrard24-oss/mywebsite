// frontend/src/hook/
import { useState } from "react";
import { deleteChatMessage } from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useDeleteChatMessage() {
  const [loading, setLoading] = useState(false);

  async function remove(params: {
    chatId: string;
    message: ChatMessage;
    onOptimistic: () => void;
    onRollback: () => void;
    onSuccess: (msg: ChatMessage) => void;
  }) {
    const {
      chatId,
      message,
      onOptimistic,
      onRollback,
      onSuccess,
    } = params;

    if (loading) return;

    setLoading(true);
    onOptimistic();

    try {
      const deleted = await deleteChatMessage({
        chatId,
        messageId: message.id,
      });

      onSuccess(deleted);
    } catch (err) {
      onRollback();
      console.error("Delete chat message failed", err);
    } finally {
      setLoading(false);
    }
  }

  return { remove, loading };
}

