// ==============================
// file: components/feed/TextFeed.tsx
// ==============================

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import type { PostFeedItem } from "@/types/post-feed";
import type { Lang } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { api } from "@/lib/api/api";

import PostComposer from "@/components/posts/PostComposer";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";

type Props = {
  user: any | null;
  initialItems: PostFeedItem[];
  lang: Lang;

  /** ควบคุมการแสดง Composer (UI only) */
  showComposer?: boolean;

  /**
   * ให้ parent (feed.tsx) ดึง refreshFeed ไปใช้
   * ❗️ไม่มีผลกับ logic เดิม
   */
  onRefreshReady?: (refreshFn: () => void) => void;
};

export default function TextFeed({
  user,
  initialItems,
  lang,
  showComposer = true,
  onRefreshReady,
}: Props) {
  const t = getDictionary(lang);

  const [items, setItems] =
    useState<PostFeedItem[]>(initialItems);
  const [refreshing, setRefreshing] =
    useState(false);

  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
  const seen = localStorage.getItem("feed_greeting_seen");

  if (!seen) {
    setShowGreeting(true);
    localStorage.setItem("feed_greeting_seen", "1");
  }
  }, []);

  const refreshFeed = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      const res = await api.get<{
        items: PostFeedItem[];
      }>("/posts", {
        params: { limit: 20 },
        withCredentials: true,
      });

      if (Array.isArray(res.data?.items)) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error("Refresh feed failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  // 🔗 expose refreshFeed ให้ parent ใช้
  useEffect(() => {
    onRefreshReady?.(refreshFeed);
  }, [onRefreshReady, refreshFeed]);

  const handlePostDeleted = useCallback(
    (postId: string) => {
      setItems((prev) =>
        prev.filter((p) => p.id !== postId)
      );
    },
    []
  );

return (
  <section
    className="
      w-full
      max-w-3xl
      mx-auto
      px-3
      sm:px-4
      md:px-6
      pt-0
      pb-6
      sm:pb-8
      flex
      flex-col
      gap-3
      sm:gap-4
      min-h-0
    "
    aria-label="User feed"
  >
    {showComposer && (
      <div className="mb-1 sm:mb-2">
        <PostComposer onPostCreated={refreshFeed} />
      </div>
    )}

    {showGreeting && (
      <article
        className="
          bg-white
          p-4
          sm:p-5
          md:p-6
          rounded-xl
          sm:rounded-2xl
          shadow
          border
        "
        aria-label="Feed greeting"
      >
        <h2
          className="
            text-base
            sm:text-lg
            md:text-xl
            font-semibold
            leading-snug
          "
        >
          {t.feed.greeting}{" "}
          {user?.displayName ||
            user?.email ||
            t.feed.greetingFallback}
        </h2>

        <p
          className="
            mt-1
            text-sm
            sm:text-base
            text-gray-600
          "
        >
          {t.feed.intro}
        </p>
      </article>
    )}

    {items.length === 0 && (
      <p
        className="
          py-6
          sm:py-8
          text-center
          text-sm
          text-gray-500
        "
        role="status"
        aria-live="polite"
      >
        {t.feed.empty}
      </p>
    )}

    {items.map((post) => (
      <article
        key={post.id}
        className="
          bg-white
          shadow-sm
          border
          rounded-xl
          sm:rounded-2xl
          p-3
          sm:p-4
          md:p-5
          flex
          flex-col
          gap-3
          sm:gap-4
        "
        aria-labelledby={`post-${post.id}`}
      >
        {/* ===== Header ===== */}
        <header
          className="
            flex
            items-start
            justify-between
            gap-2
            sm:gap-3
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
            <Link
              href={`/users/${post.author.id}`}
              className="flex-shrink-0"
            >
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName ?? "User"}
                  className="
                    h-8
                    w-8
                    sm:h-9
                    sm:w-9
                    rounded-full
                    object-cover
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

            <div className="flex min-w-0 flex-col leading-tight">
              <Link
                href={`/users/${post.author.id}`}
                id={`post-${post.id}`}
                className="
                  font-semibold
                  text-sm
                  sm:text-[0.95rem]
                  hover:underline
                  truncate
                "
              >
                {post.author.displayName ??
                  t.feed.post.authorFallback}
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
            onDeleted={() =>
              handlePostDeleted(post.id)
            }
          />
        </header>

        {/* ===== Content ===== */}
        <p
          className="
            text-gray-800
            text-sm
            sm:text-base
            leading-relaxed
            whitespace-pre-wrap
            break-words
          "
        >
          {renderContentWithHashtags(post.content)}
        </p>

        {/* ===== Media ===== */}
        {Array.isArray(post.media) &&
          post.media.length > 0 && (
            <section
              className="
                mt-2
                sm:mt-3
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
                    bg-gray-100
                  "
                >
                  {m.type === "image" && (
                    <img
                      src={m.url}
                      alt=""
                      loading="lazy"
                      className="
                        w-full
                        h-auto
                        max-h-[70vh]
                        sm:max-h-[80vh]
                        object-contain
                        bg-black/5
                      "
                    />
                  )}

                  {m.type === "video" && (
                    <video
                      src={m.url}
                      controls
                      preload="metadata"
                      className="
                        w-full
                        h-auto
                        max-h-[70vh]
                        sm:max-h-[80vh]
                        object-contain
                        bg-black
                      "
                    />
                  )}
                </figure>
              ))}
            </section>
          )}

        {/* ===== Footer ===== */}
        <footer
          className="
            flex
            gap-4
            text-xs
            sm:text-sm
            text-gray-600
          "
        >
          <span>
            ❤️ {post.stats.likeCount} {t.feed.post.likes}
          </span>
          <span>
            💬 {post.stats.commentCount} {t.feed.post.comments}
          </span>
        </footer>
      </article>
    ))}
  </section>
);


}
