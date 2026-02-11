// frontend/src/components/media/MyMediaGallery.tsx

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { MyMediaGalleryItem } from "@/types/my-media";
import MediaViewer from "@/components/media/MediaViewer";

type Props = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};

export default function MyMediaGallery({ items }: Props) {
 const [activeMediaId, setActiveMediaId] =
  useState<string | null>(null);

  /* ===============================
   * Close handlers
   * =============================== */
const closeViewer = useCallback(() => {
  setActiveMediaId(null);
}, []);


  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeViewer();
      }
    },
    [closeViewer],
  );

  useEffect(() => {
   if (activeMediaId) {
  document.addEventListener("keydown", onKeyDown);
  document.body.style.overflow = "hidden";
}
 else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeMediaId, onKeyDown]);

  /* ===============================
   * Empty state
   * =============================== */
  if (items.length === 0) {
    return (
      <section
        aria-labelledby="my-media-gallery-empty"
        className="py-12 text-center text-sm text-gray-500"
      >
        <h2 id="my-media-gallery-empty" className="sr-only">
          Your uploaded media
        </h2>
        <p>No media to display.</p>
      </section>
    );
  }

  return (
    <>
      {/* ===============================
       * Gallery Grid
       * =============================== */}
      <section
        aria-labelledby="my-media-gallery"
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
      >
        <h2 id="my-media-gallery" className="sr-only">
          Your uploaded media
        </h2>

        {items.map((item) => {
          const isUsed = item.postId !== null;

          return (
            <article
              key={item.mediaId}
              className="group relative aspect-square overflow-hidden rounded bg-gray-100"
            >
              {/* Clickable layer */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setActiveMediaId(item.mediaId)}
                className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={
                  item.type === "VIDEO"
                    ? "View video"
                    : "View image"
                }
              />

              {/* Media preview */}
              {item.type === "IMAGE" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <>
                  <Image
                    src={
                      item.thumbnailUrl ??
                      "/video-placeholder.png"
                    }
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/70 px-1 text-xs text-white"
                  >
                    ▶
                  </span>
                </>
              )}

              {/* UNUSED badge */}
              {!isUsed && (
                <span
                  className="absolute left-1 top-1 rounded bg-yellow-500/90 px-1.5 py-0.5 text-[10px] font-medium text-black"
                  title="This media is not used in any post yet"
                >
                  UNUSED
                </span>
              )}

              {/* Hover hint (PC only) */}
              <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="text-xs text-white">
                  Click to view
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* ===============================
       * Media Viewer (Modal)
       * =============================== */}
      {activeMediaId && (
  <MediaViewer
    mediaId={activeMediaId}
    onClose={closeViewer}
  />
)}

    </>
  );
}
