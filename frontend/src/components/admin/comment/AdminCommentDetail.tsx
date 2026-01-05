// frontend/src/components/admin/comment/AdminCommentDetail.tsx

import type { AdminCommentDetail } from "@/types/admin-comment";
import AdminCommentContext from "./AdminCommentContext";

type Props = {
  comment: AdminCommentDetail;
};

export default function AdminCommentDetail({
  comment,
}: Props) {
  return (
    <article className="space-y-4 rounded border p-4">
      <header className="flex items-center gap-3">
        {comment.author.avatarUrl && (
          <img
            src={comment.author.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <div className="text-sm font-medium">
            {comment.author.displayName ??
              comment.author.username}
          </div>
          <time
            className="text-xs text-gray-500"
            dateTime={comment.createdAt}
          >
            {new Date(
              comment.createdAt,
            ).toLocaleString()}
          </time>
        </div>
      </header>

      <section className="text-sm text-gray-800">
        {comment.content}
      </section>

      <AdminCommentContext post={comment.post} />

      <footer className="flex gap-4 text-xs text-gray-600">
        {comment.isDeleted && (
          <span className="text-red-600">
            Deleted ({comment.deletedSource})
          </span>
        )}
        {comment.isHidden && (
          <span className="text-orange-600">
            Hidden
          </span>
        )}
      </footer>
    </article>
  );
}
