// frontend/src/components/comments/ReplyToggle.tsx

import { useState } from "react";
import ReplyComposer from "./ReplyComposer";
import CommentReplyList from "./CommentReplyList";
import { useCommentReplies } from "@/hooks/useCommentReplies";

type Props = {
  commentId: string;
};

export default function ReplyToggle({ commentId }: Props) {
  const [open, setOpen] = useState(false);

  // SINGLE source of truth
  const replies = useCommentReplies({
    parentCommentId: commentId,
  });

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-blue-600 hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide replies" : "Reply"}
      </button>

      {open && (
        <div className="mt-2 pl-4 border-l">
          <ReplyComposer
            onSubmit={async (content) => {
              const res = await replies.submitReply(content);
              return Boolean(res);
            }}
            loading={replies.loading}
            error={replies.error}
          />

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
