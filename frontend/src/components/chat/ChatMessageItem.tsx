// frontend/src/components/chat/ChatMessageItem.tsx

import { useState } from "react";
import Link from "next/link";
import ChatMessageActions from "./ChatMessageActions";
import ChatConfirmDeleteModal from "./ChatConfirmDeleteModal";
import { useDeleteChatMessage } from "@/hooks/useDeleteChatMessage";
import type { ChatMessage } from "@/types/chat-message";

/**
 * UI-only extension
 * backend ไม่มี field นี้
 */
type ChatMessageUI = ChatMessage & {
  isDeleted?: boolean;
};

type Props = {
  message: ChatMessageUI;
  isOwn?: boolean;
  onDeleted?: (id: string) => void;
};

export default function ChatMessageItem({
  message,
  isOwn = false,
  onDeleted,
}: Props) {
  const [confirmDelete, setConfirmDelete] =
    useState(false);
  const { remove } = useDeleteChatMessage();

  /**
   * ==============================
   * DELETED STATE
   * ==============================
   */
  if (message.isDeleted) {
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

      <div
        className={`relative max-w-md rounded-lg px-3 py-2 text-sm ${
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

        {/* ===== Text ===== */}
        {hasText && (
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {/* ===== Media ===== */}
        {hasMedia && (
          <div className="mt-2 flex flex-col gap-2">
            {media.map((m) => {
              if (m.type === "image") {
                return (
                  <img
                    key={m.id}
                    src={m.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="max-h-64 w-full rounded-md object-cover"
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
                    className="w-full"
                  />
                );
              }

              return null;
            })}
          </div>
        )}

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
  onCancel={() =>
    setConfirmDelete(false)
  }
  onConfirm={() => {
    if (!message.chatId) {
      setConfirmDelete(false);
      return;
    }

    remove({
      chatId: message.chatId,
      message,
      onOptimistic: () => {
        // ปิด modal อย่างเดียว
        setConfirmDelete(false);
      },
      onRollback: () => {
        setConfirmDelete(false);
      },
      onSuccess: () => {
        // commit delete หลัง backend สำเร็จ
        onDeleted?.(message.id);
      },
    });
  }}
/>

      </div>
    </div>
  );
}
