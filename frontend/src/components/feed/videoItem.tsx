// frontend/src/components/feed/videoitem.tsx
"use client";

import { useRef } from "react";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  post: PostFeedItem;
  onLike?: (postId: string) => void; // optional (fail-soft)
};

export default function VideoItem({ post, onLike }: Props) {
  const video = post.media.find((m) => m.type === "video");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTap = useRef<number>(0);

  if (!video) return null;

  function handleTap() {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      onLike?.(post.id);
    } else {
      // ▶️ Single tap = play / pause
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    }

    lastTap.current = now;
  }

  return (
  <article
  className="
    relative
    h-screen
    w-full
    snap-start
    bg-black
    flex
    items-center
    justify-center
  "
  aria-label="Video post"
>
  {/* =========================
      Aspect Ratio Wrapper (9:16)
      ========================= */}
  <div
    className="
      relative
      h-full
      w-full
      max-w-[420px]
      aspect-[9/16]
      bg-black
      overflow-hidden
    "
  >
    {/* ===== Video ===== */}
    <video
      data-video
      ref={videoRef}
      src={video.url}
      muted
      loop
      playsInline
      preload="metadata"
      onClick={handleTap}
      className="
        absolute
        inset-0
        h-full
        w-full
        object-contain
      "
    />
  </div>

  {/* =========================
      Overlay (caption / author)
      ========================= */}
  <div
    className="
      pointer-events-none
      absolute
      bottom-6
      left-4
      right-4
      text-white
      space-y-1
      max-w-[420px]
      mx-auto
    "
  >
    <p className="text-sm font-medium">
      @{post.author.displayName ?? "user"}
    </p>

    {post.content && (
      <p className="text-xs opacity-80 line-clamp-2">
        {post.content}
      </p>
    )}
  </div>
</article>

  );
}
