// frontend/components/feed/FeedItem.tsx
import Link from "next/link";
import type { PostFeedItem } from "@/types/post-feed";
import PostActionMenu from "@/components/posts/PostActionMenu";

type Props = {
  post: PostFeedItem;
};

export default function FeedItem({ post }: Props) {
  return (
    <article
      className="rounded-lg border border-gray-200 p-4"
      aria-labelledby={`post-${post.id}`}
    >
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ===== ของเดิม: ลิงก์โปรไฟล์ผู้เขียน ===== */}
          <Link
            href={`/users/${post.author.id}`}
            className="flex items-center gap-3 hover:underline"
          >
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName ?? "User avatar"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300" />
            )}

            <div>
              <h2
                id={`post-${post.id}`}
                className="text-sm font-medium text-gray-900"
              >
                {post.author.displayName ?? "Unknown user"}
              </h2>
              <time
                dateTime={post.createdAt}
                className="block text-xs text-gray-500"
              >
                {new Date(post.createdAt).toLocaleString()}
              </time>
            </div>
          </Link>
          {/* ===== จบของเดิม ===== */}
        </div>

        <PostActionMenu
          postId={post.id}
          canDelete={post.canDelete}
          canEdit={post.canDelete}
          canReport={!post.canDelete}
        />
      </header>

      {/* ===== Content (เดิม) ===== */}
      <p className="whitespace-pre-wrap text-sm text-gray-800">
        {post.content}
      </p>

      {/* ===== Media (ใหม่ | backward-safe) ===== */}
      {Array.isArray((post as any).media) &&
        (post as any).media.length > 0 && (
          <section className="mt-3 space-y-2">
            {(post as any).media.map((m: any) => (
              <figure key={m.id} className="overflow-hidden rounded-lg">
                {m.type === "image" && (
                  <img
                    src={m.cdnUrl}
                    alt=""
                    loading="lazy"
                    className="w-full rounded-lg"
                  />
                )}

                {m.type === "video" && (
                  <video
                    src={m.cdnUrl}
                    controls
                    preload="metadata"
                    className="w-full rounded-lg"
                  />
                )}
              </figure>
            ))}
          </section>
        )}

      <footer className="mt-3 flex gap-4 text-xs text-gray-600">
        <span>❤️ {post.stats.likeCount}</span>
        <span>💬 {post.stats.commentCount}</span>
      </footer>
    </article>
  );
}
