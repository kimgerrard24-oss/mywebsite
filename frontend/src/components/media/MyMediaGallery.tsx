// frontend/src/components/media/MyMediaGallery.tsx

import Image from "next/image";
import type { MyMediaGalleryItem } from "@/types/my-media";

type Props = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};

export default function MyMediaGallery({
  items,
}: Props) {
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
            aria-label={
              isUsed
                ? "Media used in a post"
                : "Unused uploaded media"
            }
          >
            {/* ================= Media Preview ================= */}
            {item.type === "IMAGE" ? (
              <Image
                src={`/cdn/${item.objectKey}`}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                priority={false}
              />
            ) : (
              <>
                <Image
                  src={
                    item.thumbnailObjectKey
                      ? `/cdn/${item.thumbnailObjectKey}`
                      : "/video-placeholder.png"
                  }
                  alt=""
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />

                {/* ▶ play indicator */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/70 px-1 text-xs text-white"
                >
                  ▶
                </span>
              </>
            )}

            {/* ================= Used / Unused Indicator ================= */}
            {!isUsed && (
              <span
                className="absolute left-1 top-1 rounded bg-yellow-500/90 px-1.5 py-0.5 text-[10px] font-medium text-black"
                title="This media is not used in any post yet"
              >
                UNUSED
              </span>
            )}

            {/* ================= Hover Overlay ================= */}
            <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-xs text-white">
                {item.type === "VIDEO"
                  ? "Video"
                  : "Image"}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
