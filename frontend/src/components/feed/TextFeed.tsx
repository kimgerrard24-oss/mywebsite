// ==============================
// file: components/feed/TextFeed.tsx
// ==============================

import { useCallback, useState } from "react";
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
};

export default function TextFeed({
  user,
  initialItems,
  lang,
}: Props) {
  const t = getDictionary(lang);

  const [items, setItems] =
    useState<PostFeedItem[]>(initialItems);
  const [refreshing, setRefreshing] =
    useState(false);

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
      className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6"
      aria-label="User feed"
    >
      <PostComposer onPostCreated={refreshFeed} />

      <article className="bg-white p-5 sm:p-6 rounded-2xl shadow border">
        <h2 className="text-lg sm:text-xl font-semibold">
          {t.feed.greeting}{" "}
          {user?.displayName ||
            user?.email ||
            t.feed.greetingFallback}
        </h2>
        <p className="text-gray-600 mt-1">
          {t.feed.intro}
        </p>
      </article>

      {items.length === 0 && (
        <p className="text-center text-gray-500">
          {t.feed.empty}
        </p>
      )}

      {items.map((post) => (
        <article
          key={post.id}
          className="bg-white shadow-sm border rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
        >
          {/* ===== Header ===== */}
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Link href={`/users/${post.author.id}`}>
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={
                      post.author.displayName ??
                      t.feed.post.authorFallback
                    }
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                )}
              </Link>

              <div className="flex flex-col leading-tight">
                <Link
                  href={`/users/${post.author.id}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {post.author.displayName ??
                    t.feed.post.authorFallback}
                </Link>

                <time
                  className="text-gray-500 text-xs mt-0.5"
                  dateTime={post.createdAt}
                >
                  {new Date(
                    post.createdAt
                  ).toLocaleString()}
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
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderContentWithHashtags(
              post.content
            )}
          </p>

          {/* ===== Media ===== */}
          {Array.isArray(post.media) &&
            post.media.length > 0 && (
              <section className="mt-2 space-y-3">
                {post.media.map((m) => (
                  <figure
                    key={m.id}
                    className="overflow-hidden rounded-xl"
                  >
                    {m.type === "image" && (
                      <img
                        src={m.url}
                        alt=""
                        loading="lazy"
                        className="w-full rounded-xl"
                      />
                    )}

                    {m.type === "video" && (
                      <video
                        src={m.url}
                        controls
                        preload="metadata"
                        className="w-full rounded-xl"
                      />
                    )}
                  </figure>
                ))}
              </section>
            )}

          <footer className="flex gap-4 text-sm text-gray-600">
            <span>
              ❤️ {post.stats.likeCount}{" "}
              {t.feed.post.likes}
            </span>
            <span>
              💬 {post.stats.commentCount}{" "}
              {t.feed.post.comments}
            </span>
          </footer>
        </article>
      ))}
    </section>
  );
}
