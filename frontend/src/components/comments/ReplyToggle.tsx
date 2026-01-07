// frontend/src/components/comments/ReplyToggle.tsx

import { useState } from "react";
import ReplyComposer from "./ReplyComposer";
import CommentReplyList from "./CommentReplyList";
import { useCommentReplies } from "@/hooks/useCommentReplies";

type Props = {
  commentId: string;
    isBlocked?: boolean;
};

export default function ReplyToggle({
  commentId,
  isBlocked = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const replies = useCommentReplies({
    parentCommentId: commentId,
  });

  function handleToggle() {
    if (isBlocked) return; // UX guard only
    setOpen((v) => !v);
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isBlocked}
        aria-disabled={isBlocked}
        aria-expanded={open}
        className={`
          text-xs
          ${isBlocked
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:underline"}
        `}
      >
        {open ? "Hide replies" : "Reply"}
      </button>

      {open && (
        <div
          className={`
            mt-2 pl-4 border-l
            ${isBlocked ? "opacity-60 pointer-events-none" : ""}
          `}
        >
          {/* ===== Composer ===== */}
          {!isBlocked && (
            <ReplyComposer
              onSubmit={async (content) => {
                const res = await replies.submitReply(content);
                return Boolean(res);
              }}
              loading={replies.loading}
              error={replies.error}
            />
          )}

          {/* ===== Reply list (allowed to view) ===== */}
          <CommentReplyList
            items={replies.items}
            loadInitialReplies={replies.loadInitialReplies}
            loadMoreReplies={replies.loadMoreReplies}
            hasMore={replies.hasMore}
            loading={replies.loading}
            error={replies.error}
            updateItem={replies.updateItem}
            removeItem={replies.removeItem}
          />
        </div>
      )}
    </div>
  );
}

