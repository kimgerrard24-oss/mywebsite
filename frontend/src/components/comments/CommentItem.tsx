// frontend/src/components/comments/CommentItem.tsx

import type { Comment } from "@/types/comment";

type Props = {
  comment: Comment;
};

export default function CommentItem({ comment }: Props) {
  return (
    <article
      className="py-2 text-sm"
      aria-label="Comment"
    >
      <p className="text-gray-900">
        {comment.content}
      </p>

      <time
        dateTime={comment.createdAt}
        className="mt-1 block text-xs text-gray-500"
      >
        {new Date(comment.createdAt).toLocaleString()}
      </time>
    </article>
  );
}
