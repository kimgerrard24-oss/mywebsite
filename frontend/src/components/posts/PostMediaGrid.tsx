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

function isVideoMedia(media: {
  type?: string;
  url?: string;
  cdnUrl?: string | null;
}) {
  // backend hint (ใช้ได้ แต่ไม่เชื่อ 100%)
  if (media.type === "video") return true;

  const src = media.cdnUrl ?? media.url ?? "";
  const lower = src.toLowerCase();

  // fallback จาก extension (source of truth ฝั่ง UI)
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m3u8")
  );
}

export default function PostMediaGrid({ media }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  if (!Array.isArray(media) || media.length === 0) return null;

  const total = media.length;

  /* ======================================================
   * 1 IMAGE
   * ====================================================== */
  if (total === 1) {
    return (
      <section aria-label="Post media" className="mt-2">
        <MediaFigure
          media={media[0]}
          onClick={() => openViewer(0)}
          priority
          single
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

  /* ======================================================
   * 2–4+ IMAGES (Facebook-style)
   * ====================================================== */
  const main = media[0];
  const rest = media.slice(1, 4);
  const remaining = total - 4;
  
  return (
    <section aria-label="Post media" className="mt-2">
      <div className="grid grid-cols-3 gap-[2px]">
        {/* ===== LEFT (MAIN) ===== */}
        <div className="col-span-2">
          <MediaFigure
            media={main}
            onClick={() => openViewer(0)}
            priority
            tall
          />
        </div>

        {/* ===== RIGHT (STACK) ===== */}
        <div className="col-span-1 grid grid-rows-3 gap-[2px]">
          {rest.map((m, i) => {
            const index = i + 1;
            const showOverlay = index === 3 && remaining > 0;

            return (
              <div key={m.id} className="relative">
                <MediaFigure
                  media={m}
                  onClick={() => openViewer(index)}
                />

                {showOverlay && (
                  <button
                    type="button"
                    onClick={() => openViewer(index)}
                    className="
                      absolute inset-0
                      flex items-center justify-center
                      bg-black/60
                      text-white
                      text-xl font-semibold
                      rounded-md
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
  tall = false,
  single = false,
}: {
  media: MediaItem;
  onClick: () => void;
  priority?: boolean;
  tall?: boolean;
  single?: boolean;
}) {
  const src = media.cdnUrl ?? media.url ?? "";
  const isVideo = isVideoMedia(media);

  return (
    <figure
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Open media viewer"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`
  relative
  overflow-hidden
  rounded-md
  bg-black/5
  cursor-pointer
  ${single ? "aspect-[4/5] max-h-[70vh]" : ""}
  ${tall ? "min-h-[300px]" : "min-h-[100px]"}
`}
>


{isVideo ? (
  <video
    src={src}
    poster={media.thumbnailUrl ?? undefined}
    muted
    playsInline
    preload="metadata"
    className="w-full h-full object-cover"
  />
) : (
  <img
    src={src}
    alt=""
    loading={priority ? "eager" : "lazy"}
    className="w-full h-full object-cover"
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
  const isVideo = isVideoMedia(m); 

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/80
      "
      onClick={onClose}
    >
      <div
        className="max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
       
{isVideo ? (
  <video
    src={src}
    controls
    autoPlay
    playsInline
    className="max-w-[95vw] max-h-[95vh] object-contain"
  />
) : (
  <img
    src={src}
    alt=""
    className="max-w-[95vw] max-h-[95vh] object-contain"
  />
)}

      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          absolute top-4 right-4
          text-white text-2xl
        "
        aria-label="Close media viewer"
      >
        ×
      </button>
    </div>
  );
}

