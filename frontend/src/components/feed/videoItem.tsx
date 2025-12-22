// frontend/src/components/feed/videoItem.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  post: PostFeedItem;
  onLike?: (postId: string) => void;
};

export default function VideoItem({ post, onLike }: Props) {
  const video = post.media.find((m) => m.type === "video");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTap = useRef<number>(0);

  // 🔊 state ควบคุมเสียง
  const [muted, setMuted] = useState(true);

  if (!video?.url) return null;

  // ✅ ensure autoplay หลัง mount (fail-soft)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.play().catch(() => {
      // browser policy → fail-soft
    });
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

  // 🔊 toggle sound (user interaction → policy-safe)
  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;

    const nextMuted = !muted;
    v.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted && v.paused) {
      v.play().catch(() => {});
    }
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
          muted={muted}
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

        {/* 🔊 Sound Toggle Button */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="
            absolute
            bottom-4
            right-4
            z-10
            rounded-full
            bg-black/60
            px-3
            py-2
            text-white
            text-sm
            hover:bg-black/80
            transition
          "
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </article>
  );
}

