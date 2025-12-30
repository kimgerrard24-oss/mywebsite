// frontend/src/components/chat/ChatComposer.tsx

import { FormEvent, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useChatComposer } from "@/hooks/useChatComposer";
import { useChatTyping } from "@/hooks/useChatTyping";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import ChatComposerError from "./ChatComposerError";
import type { ChatMessage } from "@/types/chat-message";

type Props = {
  chatId: string;
  onMessageSent?: (message: ChatMessage) => void;
};

type PendingPreview = {
  id: string;
  type: "image" | "audio";
  previewUrl: string;
};

export default function ChatComposer({
  chatId,
  onMessageSent,
}: Props) {
  const {
    content,
    setContent,
    mediaIds,
    setMediaIds,
    submit,
    loading,
    error,
  } = useChatComposer({
    chatId,
    onSent: (message) => {
      onMessageSent?.(message);
    },
  });

  const { notifyTyping } = useChatTyping(chatId);
  const { upload } = useMediaUpload();
  const { complete } = useMediaComplete();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  /**
   * 🔹 Preview state (UI only)
   */
  const [pendingPreviews, setPendingPreviews] =
    useState<PendingPreview[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const hasText =
      typeof content === "string" &&
      content.trim().length > 0;

    const hasMedia = mediaIds.length > 0;
    if (!hasText && !hasMedia) return;

    await submit();

    // cleanup previews (memory safe)
    pendingPreviews.forEach((p) =>
      URL.revokeObjectURL(p.previewUrl),
    );
    setPendingPreviews([]);

    setContent("");
  }

  function handleEmojiSelect(emoji: EmojiClickData) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue =
      content.slice(0, start) +
      emoji.emoji +
      content.slice(end);

    setContent(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart =
        textarea.selectionEnd =
          start + emoji.emoji.length;
    });
  }

  async function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const mediaType = file.type.startsWith("audio/")
      ? "audio"
      : "image";

    const previewId = crypto.randomUUID();

    // 🔹 show preview immediately
    setPendingPreviews((prev) => [
      ...prev,
      {
        id: previewId,
        type: mediaType,
        previewUrl,
      },
    ]);

    try {
      const { objectKey } = await upload(file);

      const mediaId = await complete({
        objectKey,
        mediaType,
        mimeType: file.type,
      });

      setMediaIds((prev) => [...prev, mediaId]);
    } catch {
      // upload failed → remove preview
      setPendingPreviews((prev) =>
        prev.filter((p) => p.id !== previewId),
      );
      URL.revokeObjectURL(previewUrl);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border-t px-3 py-2"
      aria-label="Send message"
    >
      {error && <ChatComposerError message={error} />}

      {/* ===== Media Preview ===== */}
      {pendingPreviews.length > 0 && (
        <div className="mb-2 flex flex-col gap-2">
          {pendingPreviews.map((p) => {
            if (p.type === "image") {
              return (
                <img
                  key={p.id}
                  src={p.previewUrl}
                  className="max-h-40 rounded-md object-cover"
                  alt=""
                />
              );
            }

            if (p.type === "audio") {
              return (
                <audio
                  key={p.id}
                  src={p.previewUrl}
                  controls
                  preload="metadata"
                />
              );
            }

            return null;
          })}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-14 left-3 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            height={350}
            width={300}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*"
        hidden
        onChange={handleFileSelect}
      />

      <div className="flex gap-2 items-end">
        <button
          type="button"
          onClick={() =>
            setShowEmojiPicker((v) => !v)
          }
          className="px-2 text-lg"
          aria-label="Add emoji"
        >
          🙂
        </button>

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="px-2 text-lg"
          aria-label="Attach media"
        >
          📎
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            notifyTyping();
          }}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-md border px-3 py-2 text-sm"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading ||
            (!content.trim() &&
              mediaIds.length === 0)
          }
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
