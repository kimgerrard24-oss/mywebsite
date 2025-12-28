// frontend/src/hooks/useDeleteChatMessage.ts

import { useRef, useState } from "react";
import { deleteChatMessage } from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useDeleteChatMessage() {
  const [loading, setLoading] = useState(false);

  /**
   * prevent duplicate delete for the same message
   */
  const inFlightRef = useRef<Set<string>>(new Set());

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

    if (!chatId || !message?.id) {
      console.error(
        "Delete chat message aborted: invalid params",
        { chatId, messageId: message?.id },
      );
      return;
    }

    if (inFlightRef.current.has(message.id)) {
      return;
    }

    inFlightRef.current.add(message.id);
    setLoading(true);

    // optimistic UI update
    onOptimistic();

    try {
      await deleteChatMessage({
        chatId,
        messageId: message.id,
      });

      // confirm delete by id (UI layer decides how to mark delete)
      onSuccess(message);
    } catch (err) {
      onRollback();
      console.error("Delete chat message failed", err);
    } finally {
      inFlightRef.current.delete(message.id);
      setLoading(false);
    }
  }

  return { remove, loading };
}
