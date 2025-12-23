// frontend/src/components/feed/FeedItem.tsx
import Link from "next/link";
import type { PostFeedItem } from "@/types/post-feed";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import PostLikeButton from "@/components/posts/PostLikeButton";
import { usePostLike } from "@/hooks/usePostLike";

type Props = {
  post: PostFeedItem;
};

export default function FeedItem({ post }: Props) {
  const profileHref = post.canDelete
    ? "/profile"
    : `/users/${post.author.id}`;

  const {
    liked,
    likeCount,
    loading: likeLoading,
    toggleLike,
  } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByViewer ?? false,
    initialLikeCount: post.stats.likeCount,
  });

  return (
    <article
      className="
        w-full
        rounded-lg
        sm:rounded-xl
        border
        border-gray-200
        bg-white
        p-3
        sm:p-4
        md:p-5
      "
      aria-labelledby={`post-${post.id}`}
    >
      {/* ================= Header ================= */}
      <header
        className="
          mb-2
          sm:mb-3
          flex
          items-start
          justify-between
          gap-2
        "
      >
        <div
          className="
            flex
            items-start
            gap-2
            sm:gap-3
            min-w-0
          "
        >
          {/* ===== Avatar (LINK) ===== */}
          <Link href={profileHref} className="flex-shrink-0">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName ?? "User avatar"}
                className="
                  h-8
                  w-8
                  sm:h-9
                  sm:w-9
                  rounded-full
                  object-cover
                  cursor-pointer
                "
                loading="lazy"
              />
            ) : (
              <div
                className="
                  h-8
                  w-8
                  sm:h-9
                  sm:w-9
                  rounded-full
                  bg-gray-300
                "
                aria-hidden="true"
              />
            )}
          </Link>

          {/* ===== Name + Time ===== */}
          <div className="flex min-w-0 flex-col leading-tight">
            <Link
              href={profileHref}
              id={`post-${post.id}`}
              className="
                text-sm
                sm:text-[0.95rem]
                font-medium
                text-gray-900
                hover:underline
                truncate
              "
            >
              {post.author.displayName ?? "Unknown user"}
            </Link>

            <time
              dateTime={post.createdAt}
              className="
                mt-0.5
                text-xs
                text-gray-500
                whitespace-nowrap
              "
            >
              {new Date(post.createdAt).toLocaleString()}
            </time>
          </div>
        </div>

        <PostActionMenu
          postId={post.id}
          canDelete={post.canDelete}
          canEdit={post.canDelete}
          canReport={!post.canDelete}
        />
      </header>

      {/* ================= Content ================= */}
      <p
        className="
          whitespace-pre-wrap
          break-words
          text-sm
          sm:text-[0.95rem]
          text-gray-800
          leading-relaxed
        "
      >
        {renderContentWithHashtags(post.content)}
      </p>

      {/* ================= Media ================= */}
      {Array.isArray(post.media) && post.media.length > 0 && (
        <section
          className="
            mt-3
            sm:mt-4
            space-y-2
            sm:space-y-3
          "
          aria-label="Post media"
        >
          {post.media.map((m) => (
            <figure
              key={m.id}
              className="
                overflow-hidden
                rounded-lg
                sm:rounded-xl
              "
            >
              {m.type === "image" && (
                <img
                  src={m.url}
                  alt=""
                  loading="lazy"
                  className="
                    w-full
                    max-h-[360px]
                    sm:max-h-[420px]
                    md:max-h-[520px]
                    object-cover
                    bg-black/5
                  "
                />
              )}

              {m.type === "video" && (
                <div
                  className="
                    relative
                    w-full
                    aspect-video
                    bg-black
                    rounded-lg
                    sm:rounded-xl
                    overflow-hidden
                  "
                >
                  <video
                    src={m.url}
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
          ))}
        </section>
      )}

      {/* ================= Footer ================= */}
      <footer
        className="
          mt-3
          sm:mt-4
          flex
          gap-4
          text-xs
          sm:text-sm
          text-gray-600
        "
      >
        {/* 🆕 Like button (แทน span เดิมอย่างเดียว) */}
        <PostLikeButton
          liked={liked}
          likeCount={likeCount}
          loading={likeLoading}
          onClick={toggleLike}
        />

        <span>💬 {post.stats.commentCount}</span>
      </footer>
    </article>
  );
}
