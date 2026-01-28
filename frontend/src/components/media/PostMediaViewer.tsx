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

        if (m.type === "image") {
          return (
            <figure
              key={m.id}
              className="
                overflow-hidden
                rounded-lg
                sm:rounded-xl
              "
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="
                  w-full
                  max-h-[60vh]
                  sm:max-h-[70vh]
                  object-contain
                  bg-black/5
                "
              />
            </figure>
          );
        }

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
              <video
                src={src}
                controls
                preload="metadata"
                className="
                  w-full
                  max-h-[60vh]
                  sm:max-h-[70vh]
                  object-contain
                "
              />
            </figure>
          );
        }

        return null;
      })}
    </>
  );
}
