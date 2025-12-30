// frontend/src/hooks/useChatComposer.ts
import { useState } from "react";
import { sendChatMessage, getChatMessageById, } from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useChatComposer(params: {
  chatId: string;
  onSent?: (message: ChatMessage) => void;
}) {
  const [content, setContent] = useState("");
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit chat message
   * - backend is authority
   * - supports text + image + voice
   */
  async function submit() {
    if (loading) return;

    // snapshot state (prevent race condition)
    const text =
      typeof content === "string" ? content.trim() : "";

    const mediaSnapshot = Array.isArray(mediaIds)
      ? Array.from(
          new Set(mediaIds.filter((id) => typeof id === "string")),
        )
      : [];

    const hasContent = text.length > 0;
    const hasMedia = mediaSnapshot.length > 0;

    // must contain at least text or media
    if (!hasContent && !hasMedia) return;

    setLoading(true);
    setError(null);

    try {
  const message = await sendChatMessage({
    chatId: params.chatId,
    ...(hasContent ? { content: text } : {}),
    ...(hasMedia ? { mediaIds: mediaSnapshot } : {}),
  });

  // ✅ 1) append ทันที (UX สำคัญมาก)
  params.onSent?.({
    ...message,
    media: Array.isArray(message.media)
      ? message.media
      : [],
  });

  // reset local state
  setContent("");
  setMediaIds([]);

  // ✅ 2) patch message ด้วย authoritative data (media ครบ)
  if (hasMedia) {
    try {
      const fullMessage = await getChatMessageById({
        chatId: params.chatId,
        messageId: message.id,
      });

      params.onSent?.(fullMessage);
    } catch (err) {
      // fail-soft
      console.warn(
        "Failed to refetch message with media",
        err,
      );
    }
  }
} catch (err) {
  console.error("Send chat message failed:", err);
  setError("Failed to send message");
} finally {
  setLoading(false);
}

  }

  return {
    // text
    content,
    setContent,

    // media (image / voice)
    mediaIds,
    setMediaIds,

    // actions
    submit,
    loading,
    error,
  };
}
