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

  /**
   * ระบุจาก parent (เช่น ChatMessageList)
   * ว่าเป็นข้อความของ viewer หรือไม่
   */
  isOwn?: boolean;

  /**
   * callback เมื่อแก้ไขสำเร็จ
   */
  onEdited?: (msg: ChatMessageUI) => void;

  /**
   * callback เมื่อลบ (optimistic)
   */
  onDeleted?: (id: string) => void;
};

export default function ChatMessageItem({
  message,
  isOwn = false,
  onEdited,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const { remove } = useDeleteChatMessage();

  /**
   * ==============================
   * DELETED STATE (UI-only)
   * ==============================
   */
  if (message.isDeleted) {
    return (
      <div className="py-1 text-xs italic text-gray-400">
        Message deleted
      </div>
    );
  }

  /**
   * ==============================
   * EDIT MODE
   * ==============================
   */
  if (
    editing &&
    isOwn &&
    message.chatId
  ) {
    return (
      <div className="mb-2 flex items-start gap-2">
        <img
          src={
            message.sender.avatarUrl ??
            "/avatar-placeholder.png"
          }
          className="h-8 w-8 rounded-full"
          alt=""
        />

        <div className="flex-1">
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
    <div className="group relative mb-2 flex items-start gap-2">
      <img
        src={
          message.sender.avatarUrl ??
          "/avatar-placeholder.png"
        }
        className="h-8 w-8 rounded-full"
        alt=""
      />

      <div className="relative rounded-lg bg-gray-100 px-3 py-2">
        <div className="text-xs font-semibold">
          {message.sender.displayName ?? "User"}
        </div>

        <div className="text-sm">
          {message.content}
        </div>

        {message.isEdited && (
          <div className="mt-0.5 text-[10px] text-gray-400">
            edited
          </div>
        )}

        {/* =========================
            ACTIONS (เฉพาะของตัวเอง)
            ========================= */}
        {isOwn && message.chatId && (
          <>
            <ChatMessageActions
              onEdit={() => setEditing(true)}
              onDelete={() =>
                setConfirmDelete(true)
              }
            />

            <ChatConfirmDeleteModal
              open={confirmDelete}
              onCancel={() =>
                setConfirmDelete(false)
              }
              onConfirm={() =>
                remove({
                  chatId: message.chatId!,
                  message, // ✅ ChatMessageUI ⊂ ChatMessage
                  onOptimistic: () =>
                    onDeleted?.(message.id),
                  onRollback: () => {},
                  onSuccess: () => {},
                })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
