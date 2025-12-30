// frontend/src/hooks/useChatComposer.ts
import { useState } from "react";
import {
  sendChatMessage,
  getChatMessageById,
} from "@/lib/api/chat-messages";
import type { ChatMessage } from "@/types/chat-message";

export function useChatComposer(params: {
  chatId: string;
  onSent?: (message: ChatMessage) => void;
}) {
  const [content, setContent] = useState("");
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (loading) return;

    const text =
      typeof content === "string" ? content.trim() : "";

    const mediaSnapshot = Array.isArray(mediaIds)
      ? Array.from(
          new Set(mediaIds.filter((id) => typeof id === "string")),
        )
      : [];

    const hasContent = text.length > 0;
    const hasMedia = mediaSnapshot.length > 0;

    if (!hasContent && !hasMedia) return;

    setLoading(true);
    setError(null);

    try {
      /**
       * 1) Authoritative create
       */
      const baseMessage = await sendChatMessage({
        chatId: params.chatId,
        ...(hasContent ? { content: text } : {}),
        ...(hasMedia ? { mediaIds: mediaSnapshot } : {}),
      });

      /**
       * 2) Refetch authoritative message (media + url + mime)
       *    ใช้ message ตัวจริงเพียงครั้งเดียว
       */
      let finalMessage: ChatMessage = baseMessage;

      if (hasMedia) {
        try {
          const fullMessage = await getChatMessageById({
            chatId: params.chatId,
            messageId: baseMessage.id,
          });

          finalMessage = {
            ...fullMessage,
            media: Array.isArray(fullMessage.media)
              ? fullMessage.media
                  .filter(
                    (m: any) =>
                      typeof m?.url === "string" &&
                      m.url.length > 0,
                  )
                  .map((m: any) => ({
                    ...m,
                    type: m.mimeType?.startsWith("image")
                      ? "image"
                      : m.mimeType?.startsWith("audio")
                      ? "audio"
                      : "file",
                  }))
              : [],
          };
        } catch {
          // fail-soft: ใช้ baseMessage ต่อไป
        }
      }

      /**
       * 3) Append authoritative message เพียงครั้งเดียว
       */
      params.onSent?.(finalMessage);

      /**
       * 4) reset input state หลัง append เท่านั้น
       */
      setContent("");
      setMediaIds([]);
    } catch (err) {
      console.error("Send chat message failed:", err);
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return {
    content,
    setContent,
    mediaIds,
    setMediaIds,
    submit,
    loading,
    error,
  };
}
