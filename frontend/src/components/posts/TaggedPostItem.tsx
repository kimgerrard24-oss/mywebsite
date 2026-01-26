// frontend/src/components/posts/TaggedPostItem.tsx

import Link from "next/link";
import type { MyTaggedPostItem } from "@/types/tagged-posts";

type Props = {
  post: MyTaggedPostItem;
};

export default function TaggedPostItem({
  post,
}: Props) {
  return (
    <article className="p-4">
      <p className="mb-2 text-sm text-gray-800">
        {post.content}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>

        <div className="flex items-center gap-3">
          <span>❤️ {post.likeCount}</span>
          <span>💬 {post.commentCount}</span>

          <Link
            href={`/posts/${post.id}`}
            className="text-blue-600 hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
