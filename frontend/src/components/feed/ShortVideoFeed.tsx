// components/short-video/VideoFeed.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import VideoItem from "@/components/feed/videoItem";
import VideoComposer from "@/components/feed/VideoComposer";

const COMPOSER_HEIGHT = 56; // px (ประมาณความสูง VideoComposer)

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

  // 🔔 refresh หลังโพสต์คลิปใหม่
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
   * 🎯 Play only video that is truly in center
   */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const videos =
      root.querySelectorAll<HTMLVideoElement>(
        "video[data-video]"
      );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            // pause others
            videos.forEach((v) => {
              if (v !== video) v.pause();
            });

            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        root,
        threshold: 0.75,
        // ตัดบน-ล่างให้เหลือเฉพาะกลางจริง
        rootMargin: `-${COMPOSER_HEIGHT + 80}px 0px -80px 0px`,
      }
    );

    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [items]);

  function handleScroll(
    e: React.UIEvent<HTMLDivElement>,
  ) {
    const el = e.currentTarget;
    if (
      el.scrollHeight - el.scrollTop - el.clientHeight <
      300
    ) {
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
          relative
          flex-1
          overflow-y-scroll
          snap-y
          snap-mandatory
          scroll-smooth
        "
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {items.map((post) => (
          <div
            key={post.id}
            className="
              snap-start
              snap-always
              h-[calc(100vh-4rem-56px)]
              scroll-snap-stop-always
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
