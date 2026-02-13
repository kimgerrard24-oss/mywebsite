// frontend/src/components/media/MediaViewer.tsx

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMediaById } from "@/lib/api/media";
import type { MediaMetadataResponse } from "@/lib/api/media";
import Avatar from "@/components/ui/Avatar";

type Props = {
  mediaId: string;
  onClose: () => void;
};

export default function MediaViewer({ mediaId, onClose }: Props) {
  const [data, setData] =
  useState<MediaMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===============================
   * Close handlers
   * =============================== */
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onKeyDown]);

  /* ===============================
   * Fetch media detail (authoritative)
   * =============================== */
 useEffect(() => {
  let aborted = false;
  
  async function load() {
    try {
      setLoading(true);
      setError(null);

      const json = await getMediaById(mediaId);

      if (!aborted) {
        setData(json);
      }
    } catch {
      if (!aborted) {
        setError("Unable to load media");
      }
    } finally {
      if (!aborted) {
        setLoading(false);
      }
    }
  }
  setData(null);
  load();

  return () => {
    aborted = true;
  };
}, [mediaId]);


  /* ===============================
   * Loading / Error states
   * =============================== */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <span className="text-sm text-white">Loading…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <div className="rounded bg-white p-4 text-sm">
          <p className="mb-3 text-gray-700">
            {error ?? "Media not available"}
          </p>
          <button
            onClick={onClose}
            className="rounded bg-black px-3 py-1.5 text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { usedPost } = data;

  /* ===============================
   * Render
   * =============================== */
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded bg-black/60 px-3 py-1.5 text-sm text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        ✕
      </button>

      {/* Content wrapper */}
      <div
        className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-black md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= Media ================= */}
        <div className="flex flex-1 items-center justify-center bg-black">
          {data.type === "image" ? (
            <Image
              src={data.url}
              alt={usedPost?.content ?? "Media"}
              width={1600}
              height={1600}
              priority
              className="max-h-[90vh] w-auto object-contain"
            />
          ) : (
            <video
              src={data.url}
              poster={data.thumbnailUrl ?? undefined}
              controls
              autoPlay
              playsInline
              preload="metadata"
              controlsList="nodownload"
              disablePictureInPicture
              className="max-h-[90vh] w-auto bg-black"
            />
          )}
        </div>

        {/* ================= Post Context ================= */}
        <aside className="w-full max-w-md overflow-y-auto bg-white p-4 text-sm md:border-l">
          {usedPost ? (
            <>
              {/* Author */}
 <header className="mb-3 flex flex-col gap-1">
  <Link
    href={`/users/${usedPost.author.id}`}
    className="flex items-center gap-2 hover:underline"
  >
    <Avatar
      avatarUrl={usedPost.author.avatarUrl}
      name={
        usedPost.author.displayName ??
        usedPost.author.username
      }
      size={32}
    />

    <span className="font-medium">
      {usedPost.author.displayName ??
        `@${usedPost.author.username}`}
    </span>
  </Link>

  <time
    dateTime={usedPost.createdAt}
    className="text-xs text-gray-500"
  >
    {new Date(usedPost.createdAt).toLocaleString()}
  </time>
</header>



              {/* Caption */}
              <p className="whitespace-pre-wrap text-gray-800">
                {usedPost.content}
              </p>

              {/* Link to post */}
              <div className="mt-4">
                <Link
                  href={`/posts/${usedPost.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View original post
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              This media is not attached to any post.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
