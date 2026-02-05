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
  return (
    <section
      aria-labelledby="my-media-gallery"
      className="grid grid-cols-3 gap-2 sm:grid-cols-4"
    >
      <h2 id="my-media-gallery" className="sr-only">
        Your uploaded media
      </h2>

      {items.map((item) => (
        <article
          key={item.mediaId}
          className="relative aspect-square overflow-hidden rounded bg-gray-100"
        >
          {item.type === "IMAGE" ? (
            <Image
              src={`/cdn/${item.objectKey}`}
              alt=""
              fill
              sizes="(max-width: 640px) 33vw, 25vw"
              className="object-cover"
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
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-xs text-white">
                ▶
              </span>
            </>
          )}
        </article>
      ))}
    </section>
  );
}
