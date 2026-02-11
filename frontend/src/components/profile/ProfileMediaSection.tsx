// frontend/src/components/profile/ProfileMediaSection.tsx

import { useState } from "react";
import { useProfileMediaFeed } from "@/hooks/useProfileMediaFeed";
import { ProfileMediaGrid } from "./ProfileMediaGrid";
import { ProfileMediaViewer } from "./ProfileMediaViewer";

type Props = {
  userId: string;
};

export function ProfileMediaSection({ userId }: Props) {
  const { items } = useProfileMediaFeed(userId);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <>
      <ProfileMediaGrid
        items={items}
        onClick={(index) => setViewerIndex(index)}
      />

      {viewerIndex !== null && (
        <ProfileMediaViewer
          items={items}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
