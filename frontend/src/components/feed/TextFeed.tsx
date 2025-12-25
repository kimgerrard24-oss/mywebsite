// file: components/feed/TextFeed.tsx
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import type { PostFeedItem } from "@/types/post-feed";
import type { Lang } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { api } from "@/lib/api/api";

import PostComposer from "@/components/posts/PostComposer";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import CommentComposer from '@/components/comments/CommentComposer';
import { usePostLike } from "@/hooks/usePostLike";
import PostLikeButton from "@/components/posts/PostLikeButton";
import FeedItem from "@/components/feed/FeedItem";

type Props = {
  user: any | null;
  initialItems: PostFeedItem[];
  lang: Lang;

  showComposer?: boolean;
  
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
      mb-1
      sm:mb-2
    "
    aria-label="Create post"
  >
    <PostComposer onPostCreated={refreshFeed} />
  </article>
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
          <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">
            {t.feed.greeting}{" "}
            {user?.displayName ||
              user?.email ||
              t.feed.greetingFallback}
          </h2>

          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {t.feed.intro}
          </p>
        </article>
      )}

      {items.length === 0 && (
        <p
          className="py-6 sm:py-8 text-center text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          {t.feed.empty}
        </p>
      )}

      {items.map((post) => (
      <FeedItem
        key={post.id}
        post={post}
        onDeleted={handlePostDeleted}
      />
    ))}
  </section>
  );
}
