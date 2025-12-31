// frontend/src/components/comments/ReplyToggle.tsx
import { useState } from "react";
import ReplyComposer from "./ReplyComposer";
import CommentReplyList from "./CommentReplyList";

type Props = {
  commentId: string;
};

export default function ReplyToggle({ commentId }: Props) {
  const [open, setOpen] = useState(false);

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
          <ReplyComposer parentCommentId={commentId} />
          <CommentReplyList parentCommentId={commentId} />
        </div>
      )}
    </div>
  );
}
