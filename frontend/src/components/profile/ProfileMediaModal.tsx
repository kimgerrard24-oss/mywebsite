// frontend/src/components/profile/ProfileMediaModal.tsx

import { useEffect } from "react";
import type { ProfileMediaItem } from "@/types/profile-media-feed";

type Props = {
  items: ProfileMediaItem[];
  index: number;
  loading?: boolean; 
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function ProfileMediaModal({
  items,
  index,
  loading,
  onClose,
  onNavigate,
}: Props) {
  const media = items[index];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < items.length - 1)
        onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index > 0)
        onNavigate(index - 1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, items.length, onClose, onNavigate]);

  if (!media) return null;

 return (
  <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white text-2xl"
    >
      ✕
    </button>

    {loading || items.length === 0 ? (
      <div className="text-white text-sm animate-pulse">
        กำลังโหลดรูป...
      </div>
    ) : (
      <img
        src={items[index]?.url}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />
    )}

  </div>
);

}
