// frontend/src/components/media/PostMediaViewer.tsx

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  cdnUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

type Props = {
  media: MediaItem[];
};

export default function PostMediaViewer({ media }: Props) {
  return (
    <>
      {media.map((m) => {
        const src = m.cdnUrl ?? m.url;

        // ================= Image =================
        if (m.type === "image") {
          return (
            <figure
              key={m.id}
              className="
                overflow-hidden
                rounded-lg
                sm:rounded-xl
                bg-black/5
              "
            >
              {/* Aspect-ratio box: social-friendly */}
              <div className="w-full aspect-square">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />
              </div>
            </figure>
          );
        }

        // ================= Video =================
        if (m.type === "video") {
          return (
            <figure
              key={m.id}
              className="
                overflow-hidden
                rounded-lg
                sm:rounded-xl
                bg-black
              "
            >
              {/* Video keeps 16:9 */}
              <div className="w-full aspect-video">
                <video
                  src={src}
                  controls
                  preload="metadata"
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />
              </div>
            </figure>
          );
        }

        return null;
      })}
    </>
  );
}
