// frontend/src/hooks/useChatComposer.ts
import { useState } from "react";
import { sendChatMessage } from "@/lib/api/chat-messages";

export function useChatComposer(params: {
  chatId: string;
  onSent?: (message: any) => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!content.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const message = await sendChatMessage({
        chatId: params.chatId,
        content: content.trim(),
      });

      setContent("");
      params.onSent?.(message);
    } catch (e) {
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return {
    content,
    setContent,
    submit,
    loading,
    error,
  };
}
