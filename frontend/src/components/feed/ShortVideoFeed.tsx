// ==================================
// file: components/short-video/VideoFeed.tsx
// ==================================

"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import VideoItem from "@/components/feed/videoItem";
import VideoComposer from "@/components/feed/VideoComposer";

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

  useEffect(() => {
    loadMore();
  }, []);

  /**
   * ==================================
   * 🎯 PLAY ONLY VIDEO IN CENTER
   * ==================================
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
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        root, // ✅ ใช้ container เป็น viewport
        threshold: 0.6,
        /**
         * ✅ บังคับให้ต้องอยู่ "กลางจอ"
         * - ตัดบน 20%
         * - ตัดล่าง 20%
         */
        rootMargin: "-20% 0px -20% 0px",
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
    {/* ==============================
        🎬 Video Composer (FIXED)
        ============================== */}
    <div className="sticky top-0 z-10 bg-black">
      <VideoComposer />
    </div>

    {/* ==============================
        🎥 Video Feed (SCROLL + SNAP)
        ============================== */}
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="
        flex-1
        overflow-y-scroll
        snap-y snap-mandatory
      "
    >
      {items.map((post) => (
        <div
          key={post.id}
          className="snap-start h-screen"
        >
          <VideoItem
            post={post}
            onLike={(postId) => {
              // TODO: connect like API
              console.log("like video:", postId);
            }}
          />
        </div>
      ))}

      {loading && (
        <div className="py-6 text-center text-sm text-gray-400">
          กำลังโหลดวิดีโอ…
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="py-6 text-center text-xs text-gray-500">
          ไม่มีวิดีโอเพิ่มเติม
        </div>
      )}
    </div>
  </section>
);

}
