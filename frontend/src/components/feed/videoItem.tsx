// frontend/src/components/feed/videoItem.tsx
"use client";

import { useRef, useEffect } from "react";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  post: PostFeedItem;
  onLike?: (postId: string) => void;
};

export default function VideoItem({ post, onLike }: Props) {
  const video = post.media.find((m) => m.type === "video");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTap = useRef<number>(0);

  if (!video?.url) return null;

  // ▶️ AUTOPLAY เมื่อ component mount (คลิปแรกที่เข้า feed)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // browser policy-safe autoplay
    v.play().catch(() => {
      // fail-soft (Safari / Chrome mobile)
    });
  }, []);

  function handleTap() {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      onLike?.(post.id);
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
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
        <video
          ref={videoRef}
          data-video
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
    </article>
  );
}
