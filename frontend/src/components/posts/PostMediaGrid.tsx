// frontend/src/components/posts/PostMediaGrid.tsx

import { useCallback, useState } from "react";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url?: string;
  cdnUrl?: string | null;
  thumbnailUrl?: string | null;
};

type Props = {
  media: MediaItem[];
};

export default function PostMediaGrid({ media }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  // ===== helpers =====
  const getSrc = (m: MediaItem) => m.cdnUrl ?? m.url ?? "";
  const total = media.length;

  // ===== single =====
  if (total === 1) {
    const m = media[0];
    return (
      <section aria-label="Post media" className="mt-3 sm:mt-4">
        <MediaFigure
          media={m}
          onClick={() => openViewer(0)}
          priority
        />
        {viewerIndex !== null && (
          <MediaViewer
            media={media}
            index={viewerIndex}
            onClose={closeViewer}
          />
        )}
      </section>
    );
  }

  // ===== grid (2–4+) =====
  const main = media[0];
  const rest = media.slice(1, 4); // show max 3 on the right
  const remaining = total - 4;

  return (
    <section
      aria-label="Post media"
      className="mt-3 sm:mt-4"
    >
      <div
        className="
          grid
          grid-cols-3
          gap-1.5
          sm:gap-2
        "
      >
        {/* ===== left: main ===== */}
        <div className="col-span-2">
          <MediaFigure
            media={main}
            onClick={() => openViewer(0)}
            priority
          />
        </div>

        {/* ===== right: grid ===== */}
        <div className="col-span-1 grid grid-rows-3 gap-1.5 sm:gap-2">
          {rest.map((m, i) => {
            const index = i + 1;
            const isLastVisible =
              index === 3 && remaining > 0;

            return (
              <div key={m.id} className="relative">
                <MediaFigure
                  media={m}
                  onClick={() => openViewer(index)}
                />

                {isLastVisible && (
                  <button
                    type="button"
                    onClick={() => openViewer(index)}
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-black/60
                      text-white
                      text-xl
                      font-semibold
                      rounded-lg
                      sm:rounded-xl
                    "
                    aria-label={`View ${remaining} more media`}
                  >
                    +{remaining}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {viewerIndex !== null && (
        <MediaViewer
          media={media}
          index={viewerIndex}
          onClose={closeViewer}
        />
      )}
    </section>
  );
}

/* ======================================================
 * Media Figure
 * ====================================================== */
function MediaFigure({
  media,
  onClick,
  priority = false,
}: {
  media: MediaItem;
  onClick: () => void;
  priority?: boolean;
}) {
  const src = media.cdnUrl ?? media.url ?? "";

  return (
    <figure
      className="
        relative
        overflow-hidden
        rounded-lg
        sm:rounded-xl
        bg-black/5
        cursor-pointer
        group
        aspect-square
      "
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label="Open media viewer"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      {media.type === "image" ? (
        <img
          src={src}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-200
            group-hover:scale-[1.02]
          "
        />
      ) : (
        <video
          src={src}
          poster={media.thumbnailUrl ?? undefined}
          muted
          playsInline
          preload="metadata"
          className="
            h-full
            w-full
            object-cover
          "
        />
      )}
    </figure>
  );
}

/* ======================================================
 * Media Viewer (Modal)
 * ====================================================== */
function MediaViewer({
  media,
  index,
  onClose,
}: {
  media: MediaItem[];
  index: number;
  onClose: () => void;
}) {
  const m = media[index];
  const src = m.cdnUrl ?? m.url ?? "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/80
      "
      onClick={onClose}
    >
      <div
        className="
          max-w-[95vw]
          max-h-[95vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {m.type === "image" ? (
          <img
            src={src}
            alt=""
            className="
              max-h-[95vh]
              max-w-[95vw]
              object-contain
            "
          />
        ) : (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="
              max-h-[95vh]
              max-w-[95vw]
              object-contain
            "
          />
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          absolute
          top-4
          right-4
          text-white
          text-2xl
        "
        aria-label="Close media viewer"
      >
        ×
      </button>
    </div>
  );
}
