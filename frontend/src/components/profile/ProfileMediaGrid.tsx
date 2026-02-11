// frontend/src/components/profile/ProfileMediaGrid.tsx

import type { ProfileMediaItem } from "@/types/profile-media-feed";

type Props = {
  items: ProfileMediaItem[];
  onClick: (index: number) => void;
};

export function ProfileMediaGrid({ items, onClick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((media, index) => (
        <button
          key={media.id}
          type="button"
          onClick={() => onClick(index)}
          className="relative aspect-square overflow-hidden rounded-md"
        >
          <img
            src={media.thumbnailUrl || media.url}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
