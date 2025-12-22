// components/short-video/VideoFeed.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import VideoItem from "@/components/feed/videoItem";
import VideoComposer from "@/components/feed/VideoComposer";

const COMPOSER_HEIGHT = 56; // px

export default function VideoFeed() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<PostFeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore() {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await getVideoFeed({
        limit: 5,
        cursor: cursor ?? undefined,
      });

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor ?? null);

      if (!res.nextCursor) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshLatest() {
    try {
      const res = await getVideoFeed({ limit: 1 });
      if (res.items?.[0]) {
        setItems((prev) => [res.items[0], ...prev]);
      }
    } catch (err) {
      console.error("Refresh video feed failed", err);
    }
  }

  useEffect(() => {
    loadMore();
  }, []);

  /**
   * ✅ AUTOPLAY first video
   */
  useEffect(() => {
    const root = containerRef.current;
    if (!root || items.length === 0) return;

    const firstVideo =
      root.querySelector<HTMLVideoElement>("video[data-video]");

    firstVideo?.play().catch(() => {});
  }, [items]);

  /**
   * 🎯 Play video when mostly visible (smooth)
   */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const videos =
      root.querySelectorAll<HTMLVideoElement>("video[data-video]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.intersectionRatio >= 0.6) {
            videos.forEach((v) => v !== video && v.pause());
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        root,
        threshold: [0.6],
        rootMargin: `-${COMPOSER_HEIGHT}px 0px 0px 0px`,
      }
    );

    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [items]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      loadMore();
    }
  }

  return (
    <section
      aria-label="Short video feed"
      className="
        h-[calc(100vh-4rem)]
        bg-black
        rounded-xl
        lg:rounded-2xl
        overflow-hidden
        flex
        flex-col
      "
    >
      {/* 🎬 Video Composer */}
      <div className="sticky top-0 z-10 bg-black">
        <VideoComposer onPosted={refreshLatest} />
      </div>

      {/* 🎥 Video Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex-1
          overflow-y-scroll
          snap-y
          snap-mandatory
          scroll-smooth
        "
      >
        {items.map((post) => (
          <div
            key={post.id}
            className="
              snap-center
              h-[calc(100vh-4rem-56px)]
              flex
              items-center
              justify-center
            "
          >
            <VideoItem post={post} />
          </div>
        ))}

        {loading && (
          <div className="py-6 text-center text-sm text-gray-400">
            กำลังโหลดวิดีโอ…
          </div>
        )}
      </div>
    </section>
  );
}
