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

  /**
   * ✅ RESET VIDEO STATE ทุกครั้งที่เปลี่ยน post
   * ป้องกันเสียงคลิปก่อนหน้า
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.pause();
    v.muted = true;
    v.currentTime = 0;
    v.load(); // 🔥 สำคัญมาก
    setMuted(true);

    v.play().catch(() => {});
  }, [post.id]);

  function handleTap() {
    const now = Date.now();

    // ❤️ double tap = like
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

  // 🔊 toggle sound (policy-safe)
  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;

    const nextMuted = !muted;
    v.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
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
        max-w-full
        sm:max-w-[420px]
        md:max-w-[480px]
        lg:max-w-[420px]
        aspect-[9/16]
        bg-black
        overflow-hidden
      "
    >
      <video
        key={post.id} // 🔥 บังคับ remount
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

      {/* 🔊 Sound Toggle */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="
          absolute
          bottom-3
          right-3
          sm:bottom-4
          sm:right-4
          z-10
          rounded-full
          bg-black/60
          px-2.5
          py-1.5
          sm:px-3
          sm:py-2
          text-xs
          sm:text-sm
          text-white
          hover:bg-black/80
          transition
          focus:outline-none
          focus:ring-2
          focus:ring-white/40
        "
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  </article>
);

}
