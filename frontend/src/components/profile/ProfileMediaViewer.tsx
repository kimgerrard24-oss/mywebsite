// frontend/src/components/profile/ProfileMediaViewer.tsx

import { useSetCurrentProfileMedia } from "@/hooks/useSetCurrentProfileMedia";
import type { ProfileMediaItem } from "@/types/profile-media-feed";

type Props = {
  items: ProfileMediaItem[];
  index: number;
  onClose: () => void;
};

export function ProfileMediaViewer({ items, index, onClose }: Props) {
  const media = items[index];
  const { setCurrent, loading } = useSetCurrentProfileMedia();

  if (!media) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      <img
        src={media.url}
        alt=""
        className="max-h-[80vh] max-w-[90vw] object-contain"
      />

      <div className="mt-4 flex gap-3">
        <button
          disabled={loading}
          onClick={() => setCurrent(media.id, "AVATAR")}
          className="px-4 py-2 rounded bg-white text-black"
        >
          ตั้งเป็นรูปโปรไฟล์
        </button>

        <button
          disabled={loading}
          onClick={() => setCurrent(media.id, "COVER")}
          className="px-4 py-2 rounded bg-white text-black"
        >
          ตั้งเป็นรูปปก
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-500 text-white"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
