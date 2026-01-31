// frontend/src/components/chat/ChatMessageItem.tsx

import { useState } from "react";
import Link from "next/link";
import ChatMessageActions from "./ChatMessageActions";
import ChatConfirmDeleteModal from "./ChatConfirmDeleteModal";
import { useDeleteChatMessage } from "@/hooks/useDeleteChatMessage";
import type { ChatMessage } from "@/types/chat-message";
import ChatImagePreviewModal from "./ChatImagePreviewModal";
import ReportDialog from "@/components/report/ReportDialog";

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

function MessageFooter({
  isOwn,
  timeLabel,
  onDelete,
  onReport,
  isBlocked,
}: {
  isOwn: boolean;
  timeLabel: string;
  onDelete: () => void;
  onReport: () => void;
  isBlocked: boolean;
}) {
  return (
  <div
    className={`mt-1 flex items-center justify-end gap-2 text-[10px] pointer-events-auto ${
      isOwn ? "text-blue-200" : "text-gray-400"
    }`}
  >

      <span>{timeLabel}</span>

      {isOwn && (
        <ChatMessageActions onDelete={onDelete} />
      )}

      {!isOwn && !isBlocked && (
        <button
          type="button"
          onClick={onReport}
          className="text-red-500 hover:underline"
        >
          Report
        </button>
      )}
    </div>
  );
}


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
  const [reportOpen, setReportOpen] = useState(false);
  
  const isBlocked =
  message.sender?.isBlocked === true ||
  message.sender?.hasBlockedViewer === true;

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
  
 const isPostShare =
  message.type === "POST_SHARE";

const sharedPostId =
  message.sharedPost?.id ?? null;

  if (isPostShare && !sharedPostId) {
  console.warn(
    "[ChatMessageItem] POST_SHARE without sharedPost",
    message,
  );
}

  
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
  isBlocked ? (
    <div className="mr-2 flex-shrink-0 opacity-60 cursor-not-allowed">
      <div
  className="
    h-8
    w-8
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
  "
  aria-hidden
>
  {message.sender.avatarUrl ? (
    <img
      src={message.sender.avatarUrl}
      className="h-full w-full object-cover"
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-[10px] font-semibold text-gray-700">
      {(message.sender.displayName ?? "U")
        .trim()
        .charAt(0)
        .toUpperCase()}
    </span>
  )}
</div>

    </div>
  ) : (
    <Link
      href={`/users/${message.sender.id}`}
      className="mr-2 flex-shrink-0"
    >
      <div
  className="
    h-8
    w-8
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
  "
  aria-hidden
>
  {message.sender.avatarUrl ? (
    <img
      src={message.sender.avatarUrl}
      className="h-full w-full object-cover cursor-pointer"
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-[10px] font-semibold text-gray-700 cursor-pointer">
      {(message.sender.displayName ?? "U")
        .trim()
        .charAt(0)
        .toUpperCase()}
    </span>
  )}
</div>

    </Link>
  )
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
  aria-disabled={isBlocked} 
  onClick={() => {
    if (isBlocked) return;
    setPreviewImage(m.url);
  }}
  className={`
    rounded-xl
    max-w-[220px]
    sm:max-w-[260px]
    max-h-[260px]
    object-cover
    ${isBlocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
  `}
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
     
           {/* ===== Shared Post Bubble ===== */}
{isPostShare && (
  sharedPostId ? (
    <div
  className={`
    mb-1
    max-w-[260px]
    rounded-xl
    border
    bg-white
    p-3
    shadow-sm
    ${isBlocked ? "opacity-60" : ""}
  `}
>

      <Link
  href={`/posts/${sharedPostId}`}
  className={isBlocked ? "pointer-events-none" : ""}
>
  <div className="text-xs text-gray-500 mb-1">
    Shared a post
  </div>
  <div className="text-sm font-medium text-blue-600">
    View post
  </div>
</Link>


      {/* ✅ Footer ที่เพิ่ม */}
      <MessageFooter
        isOwn={isOwn}
        timeLabel={timeLabel}
        isBlocked={isBlocked}
        onDelete={() => setConfirmDelete(true)}
        onReport={() => setReportOpen(true)}
      />
    </div>
  ) : (

    <div
      className={`
        mb-1
        max-w-[260px]
        rounded-xl
        border
        bg-gray-50
        p-3
        text-sm
        text-gray-400
        ${isBlocked ? "opacity-60" : ""}
      `}
    >
      Post unavailable
    </div>
  )
)}



      {/* ===== Bubble (TEXT ONLY) ===== */}
      {hasText && !isPostShare &&  (
        <div
        aria-disabled={isBlocked} 
        className={`relative rounded-lg px-3 py-2 text-sm ${
          isOwn
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
         } ${isBlocked ? "opacity-60 pointer-events-none" : ""}`}
        >

          {!isOwn && (
  <div
    className={`mb-0.5 text-xs font-semibold ${
      isBlocked ? "opacity-60" : ""
    }`}
  >
    {message.sender.displayName ?? "User"}
  </div>
)}


          <div className="whitespace-pre-wrap">
            {message.content}
          </div>

      {/* ===== Footer ===== */}
<MessageFooter
  isOwn={isOwn}
  timeLabel={timeLabel}
  isBlocked={isBlocked}
  onDelete={() => setConfirmDelete(true)}
  onReport={() => setReportOpen(true)}
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

{reportOpen && (
  <ReportDialog
    targetType="CHAT_MESSAGE"
    targetId={message.id}
    onClose={() => setReportOpen(false)}
  />
)}

  </div>
);

}
