// frontend/src/components/chat/ChatMessageItem.tsx

import { useState } from "react";
import ChatMessageEditor from "./ChatMessageEditor";
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
  onEdited?: (msg: ChatMessageUI) => void;
  onDeleted?: (id: string) => void;
};

export default function ChatMessageItem({
  message,
  isOwn = false,
  onEdited,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  /**
   * ==============================
   * EDIT MODE
   * ==============================
   */
  if (editing && isOwn && message.chatId) {
    return (
      <div className="mb-2 flex justify-end">
        <div className="w-full max-w-md">
          <ChatMessageEditor
            chatId={message.chatId}
            messageId={message.id}
            initialContent={message.content}
            onSaved={(updated) => {
              setEditing(false);
              onEdited?.(updated as ChatMessageUI);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

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
        <img
          src={
            message.sender.avatarUrl ??
            "/avatar-placeholder.png"
          }
          className="mr-2 h-8 w-8 rounded-full"
          alt=""
        />
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

        <div>{message.content}</div>

        {message.isEdited && (
          <div
            className={`mt-0.5 text-[10px] ${
              isOwn
                ? "text-blue-200"
                : "text-gray-400"
            }`}
          >
            edited
          </div>
        )}

        {/* ACTIONS: แสดงสำหรับข้อความของตัวเอง */}
        {isOwn && (
          <div className="absolute -top-2 -right-2">
            <ChatMessageActions
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirmDelete(true)}
            />

            <ChatConfirmDeleteModal
              open={confirmDelete}
              onCancel={() =>
                setConfirmDelete(false)
              }
              onConfirm={() => {
                if (!message.chatId) {
                  // fail-soft: ไม่มี chatId ไม่ควรลบ
                  setConfirmDelete(false);
                  return;
                }

                remove({
                  chatId: message.chatId,
                  message,
                  onOptimistic: () => {
                    setConfirmDelete(false);
                    onDeleted?.(message.id);
                  },
                  onRollback: () => {
                    setConfirmDelete(false);
                  },
                  onSuccess: () => {},
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

