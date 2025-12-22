// frontend/src/components/feed/videoItem.tsx
"use client";

import { useEffect, useRef } from "react";
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

  // ✅ ensure autoplay หลัง mount (fail-soft)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.play().catch(() => {
        // browser policy → fail-soft
      });
    };

    tryPlay();
  }, []);

  function handleTap() {
    const now = Date.now();

    // ❤️ double tap = like
    if (now - lastTap.current < 300) {
      onLike?.(post.id);
    } else if (videoRef.current) {
      // ▶️ single tap = play / pause
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
          autoPlay
          loop
          playsInline
          preload="auto"
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
