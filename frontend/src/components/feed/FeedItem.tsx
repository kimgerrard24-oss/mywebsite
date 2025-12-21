// frontend/components/feed/FeedItem.tsx
import Link from "next/link";
import type { PostFeedItem } from "@/types/post-feed";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";

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
          {/* ===== Avatar + Name (LINK) ===== */}
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

            <h2
              id={`post-${post.id}`}
              className="text-sm font-medium text-gray-900"
            >
              {post.author.displayName ?? "Unknown user"}
            </h2>
          </Link>

          {/* ===== Time (NOT a link) ===== */}
          <time
            dateTime={post.createdAt}
            className="text-xs text-gray-500"
          >
            {new Date(post.createdAt).toLocaleString()}
          </time>
        </div>

        <PostActionMenu
          postId={post.id}
          canDelete={post.canDelete}
          canEdit={post.canDelete}
          canReport={!post.canDelete}
        />
      </header>

      {/* ===== Content ===== */}
      <p className="whitespace-pre-wrap text-sm text-gray-800">
        {renderContentWithHashtags(post.content)}
      </p>

      {/* ===== Media ===== */}
      {Array.isArray(post.media) && post.media.length > 0 && (
        <section className="mt-3 space-y-2">
          {post.media.map((m) => {
            const src = m.url;

            return (
              <figure
                key={m.id}
                className="overflow-hidden rounded-lg"
              >
                {m.type === "image" && (
  <img
    src={src}
    alt=""
    loading="lazy"
    className="
      w-full
      max-h-[520px]
      object-cover
      rounded-lg
      bg-black/5
    "
  />
)}


{m.type === "video" && (
  <div
    className="
      relative
      w-full
      max-h-[520px]
      aspect-video
      bg-black
      rounded-lg
      overflow-hidden
    "
  >
    <video
      src={src}
      controls
      preload="metadata"
      className="
        absolute
        inset-0
        h-full
        w-full
        object-contain
      "
    />
  </div>
)}


              </figure>
            );
          })}
        </section>
      )}

      <footer className="mt-3 flex gap-4 text-xs text-gray-600">
        <span>❤️ {post.stats.likeCount}</span>
        <span>💬 {post.stats.commentCount}</span>
      </footer>
    </article>
  );
}

