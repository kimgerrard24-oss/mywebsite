// frontend/src/components/chat/ChatMessageItem.tsx

import { useState } from "react";
import Link from "next/link";
import ChatMessageActions from "./ChatMessageActions";
import ChatConfirmDeleteModal from "./ChatConfirmDeleteModal";
import { useDeleteChatMessage } from "@/hooks/useDeleteChatMessage";
import type { ChatMessage } from "@/types/chat-message";
import ChatImagePreviewModal from "./ChatImagePreviewModal";

/**
 * UI-only extension
 * backend ไม่มี field นี้
 */
type ChatMessageUI = ChatMessage & {
  isDeleted?: boolean;
};

type Props = {
  chatId: string;
  message: ChatMessageUI;
  isOwn?: boolean;
  onDeleted?: (id: string) => void;
};

export default function ChatMessageItem({
  chatId,
  message,
  isOwn = false,
  onDeleted,
}: Props) {
  const [confirmDelete, setConfirmDelete] =
    useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const { remove } = useDeleteChatMessage();

 /**
 * ==============================
 * DELETED STATE (persistent + realtime)
 * ==============================
 */
if (message.isDeleted || message.deletedAt) {
  return (
    <div
      className={`mb-2 text-xs italic text-gray-400 ${
        isOwn ? "text-right" : "text-left"
      }`}
    >
      Message deleted
    </div>
  );
}


  const timeLabel = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" },
      )
    : "";

  const hasText =
    typeof message.content === "string" &&
    message.content.trim().length > 0;

  const media =
    Array.isArray(message.media)
      ? message.media.filter(
          (m) =>
            m &&
            typeof m.url === "string" &&
            m.url.length > 0,
        )
      : [];

  const hasMedia = media.length > 0;

  /**
   * ==============================
   * VIEW MODE
   * ==============================
   */
  return (
  <div
    className={`mb-2 flex ${
      isOwn ? "justify-end" : "justify-start"
    }`}
  >
    {!isOwn && (
      <Link
        href={`/users/${message.sender.id}`}
        className="mr-2 flex-shrink-0"
      >
        <img
          src={
            message.sender.avatarUrl ??
            "/avatar-placeholder.png"
          }
          className="h-8 w-8 rounded-full cursor-pointer"
          alt={
            message.sender.displayName ??
            "User avatar"
          }
          loading="lazy"
        />
      </Link>
    )}

    {/* ===== Message Content Wrapper ===== */}
    <div className="flex flex-col items-end max-w-xs sm:max-w-sm">
      {/* ===== Media (OUTSIDE bubble) ===== */}
      {hasMedia && (
        <div
          className={`mb-1 flex flex-col gap-2 ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          {media.map((m) => {
            if (m.type === "image") {
              return (
                <img
  key={m.id}
  src={m.url}
  alt="Chat image"
  loading="lazy"
  decoding="async"
  referrerPolicy="no-referrer"
  className="
    rounded-xl
    max-w-[220px]
    sm:max-w-[260px]
    max-h-[260px]
    object-cover
    cursor-pointer
  "
  onClick={() => setPreviewImage(m.url)}
/>

              );
            }

            if (m.type === "audio") {
              return (
                <audio
                  key={m.id}
                  controls
                  preload="metadata"
                  src={m.url}
                  controlsList="nodownload noplaybackrate"
                  className="max-w-[260px]"
                />
              );
            }

            return null;
          })}
        </div>
      )}

      {/* ===== Bubble (TEXT ONLY) ===== */}
      {hasText && (
        <div
          className={`relative rounded-lg px-3 py-2 text-sm ${
            isOwn
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {!isOwn && (
            <div className="mb-0.5 text-xs font-semibold">
              {message.sender.displayName ?? "User"}
            </div>
          )}

          <div className="whitespace-pre-wrap">
            {message.content}
          </div>

          {/* ===== Footer ===== */}
          <div
            className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
              isOwn
                ? "text-blue-200"
                : "text-gray-400"
            }`}
          >
            <span>{timeLabel}</span>

            {isOwn && (
              <ChatMessageActions
                onDelete={() =>
                  setConfirmDelete(true)
                }
              />
            )}
          </div>

          <ChatConfirmDeleteModal
            open={confirmDelete}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              remove({
                chatId,
                message,
                onOptimistic: () => {
                  onDeleted?.(message.id);
                  setConfirmDelete(false);
                },
                onRollback: () => {
                  setConfirmDelete(false);
                },
                onSuccess: () => {
                  // noop
                },
              });
            }}
          />
        </div>
      )}
    </div>

    {previewImage && (
  <ChatImagePreviewModal
    src={previewImage}
    onClose={() => setPreviewImage(null)}
  />
)}

  </div>
);

}
