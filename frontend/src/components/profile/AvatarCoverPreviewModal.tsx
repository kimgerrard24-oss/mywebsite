// frontend/src/components/profile/AvatarCoverPreviewModal.tsx

import React from "react";

type Props = {
  imageUrl: string;
  onClose: () => void;
};

export default function AvatarCoverPreviewModal({
  imageUrl,
  onClose,
}: Props) {
  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/80
        flex items-center justify-center
        p-4
      "
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt=""
        className="
          max-h-[90vh]
          max-w-[90vw]
          rounded-lg
          shadow-lg
        "
      />
    </div>
  );
}
