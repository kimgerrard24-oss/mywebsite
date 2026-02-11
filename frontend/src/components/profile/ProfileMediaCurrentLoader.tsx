// frontend/src/components/profile/ProfileMediaCurrentLoader.tsx

import React from "react";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import AvatarCoverPreviewModal from "./AvatarCoverPreviewModal";

type Props = {
  userId: string;
};

export default function ProfileMediaCurrentLoader({ userId }: Props) {
  const { data } = useCurrentProfileMedia(userId);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  if (!data) return null;

  return (
    <>
      {/* Avatar click */}
      {data.avatar && (
        <button
          type="button"
          onClick={() => setPreviewUrl(data.avatar!.url)}
          className="hidden"
        />
      )}

      {/* Cover click */}
      {data.cover && (
        <button
          type="button"
          onClick={() => setPreviewUrl(data.cover!.url)}
          className="hidden"
        />
      )}

      {previewUrl && (
        <AvatarCoverPreviewModal
          imageUrl={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}
