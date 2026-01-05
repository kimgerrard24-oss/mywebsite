// frontend/src/components/admin/post/AdminPostDetail.tsx

import type { AdminPostDetail } from "@/types/admin-post";
import AdminPostMedia from "./AdminPostMedia";

type Props = {
  post: AdminPostDetail;
};

export default function AdminPostDetail({
  post,
}: Props) {
  return (
    <article className="space-y-4 rounded border p-4">
      <header className="flex items-center gap-3">
        {post.author.avatarUrl && (
          <img
            src={post.author.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <div className="text-sm font-medium">
            {post.author.displayName ??
              post.author.username}
          </div>
          <time
            className="text-xs text-gray-500"
            dateTime={post.createdAt}
          >
            {new Date(post.createdAt).toLocaleString()}
          </time>
        </div>
      </header>

      <section className="text-sm text-gray-800">
        {post.content}
      </section>

      <AdminPostMedia postId={post.id} />

      <footer className="flex gap-4 text-xs text-gray-600">
        <span>
          Comments: {post.stats.commentCount}
        </span>
        <span>
          Likes: {post.stats.likeCount}
        </span>
        {post.isDeleted && (
          <span className="text-red-600">
            Deleted ({post.deletedSource})
          </span>
        )}
        {post.isHidden && (
          <span className="text-orange-600">
            Hidden
          </span>
        )}
      </footer>
    </article>
  );
}
