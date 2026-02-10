// frontend/src/components/media/MyMediaGallery.tsx

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { MyMediaGalleryItem } from "@/types/my-media";

type Props = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};

export default function MyMediaGallery({ items }: Props) {
  const [active, setActive] =
    useState<MyMediaGalleryItem | null>(null);

  /* ===============================
   * Close handlers
   * =============================== */
  const closeViewer = useCallback(() => {
    setActive(null);
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
    if (active) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden"; // lock scroll
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [active, onKeyDown]);

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
                onClick={() => setActive(item)}
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
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close media viewer"
            className="absolute right-4 top-4 rounded bg-black/60 px-3 py-1.5 text-sm text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ✕
          </button>

          {/* Content */}
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {active.type === "IMAGE" ? (
              <Image
                src={active.url}
                alt=""
                width={1600}
                height={1600}
                className="max-h-[90vh] w-auto rounded object-contain"
                priority
              />
            ) : (
              <video
                src={active.url}
                controls
                autoPlay
                className="max-h-[90vh] w-auto rounded bg-black"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
