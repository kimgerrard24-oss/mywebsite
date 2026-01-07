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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTap = useRef<number>(0);

  // 🔊 sound state
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);

  const isBlocked = post.author.isBlocked === true;

  if (!video?.url) return null;

  /**
   * ✅ RESET VIDEO STATE เมื่อเปลี่ยน post
   * ป้องกันเสียงคลิปก่อนหน้า
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.pause();
    v.currentTime = 0;
    v.muted = true;
    v.volume = volume;
    v.load(); // 🔥 สำคัญ
    setMuted(true);

    v.play().catch(() => {});
  }, [post.id]); // ❗ only when post changes

  function handleTap() {
    const now = Date.now();

    // ❤️ double tap = like
    if (now - lastTap.current < 300) {
  if (!isBlocked) {
    onLike?.(post.id);
  }
} else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }

    lastTap.current = now;
  }

  // 🔊 toggle mute
  function toggleSound() {
  if (isBlocked) return;

  const v = videoRef.current;
  if (!v) return;


    const nextMuted = !muted;
    v.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      v.play().catch(() => {});
    }
  }

  // 🔉 change volume
  function handleVolumeChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const v = videoRef.current;
    if (!v) return;

    const nextVolume = Number(e.target.value);
    v.volume = nextVolume;
    setVolume(nextVolume);

    if (v.muted && nextVolume > 0) {
      v.muted = false;
      setMuted(false);
    }
  }

  // ⛶ fullscreen
  function enterFullscreen() {
  if (isBlocked) return;

  const el = containerRef.current;
  if (!el) return;


    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
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
        ref={containerRef}
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
          key={post.id} // 🔥 force remount
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

        {/* ===== Controls ===== */}
        <div
  className={`
    absolute bottom-3 right-3 z-10
    flex items-center gap-2
    bg-black/60 rounded-full
    px-2.5 py-1.5
    ${isBlocked ? "opacity-50 pointer-events-none" : ""}
  `}
>

          {/* 🔊 mute */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="text-white text-sm"
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* 🔉 volume */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 accent-white"
          />

          {/* ⛶ fullscreen */}
          <button
            type="button"
            onClick={enterFullscreen}
            aria-label="Fullscreen"
            className="text-white text-sm"
          >
            ⛶
          </button>
        </div>
      </div>
    </article>
  );
}
