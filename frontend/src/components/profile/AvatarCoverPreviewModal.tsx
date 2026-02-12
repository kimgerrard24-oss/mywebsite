// frontend/src/components/profile/AvatarCoverPreviewModal.tsx

import React, { useEffect } from "react";

type Props = {
  imageUrl: string;
  onClose: () => void;
};

export default function AvatarCoverPreviewModal({
  imageUrl,
  onClose,
}: Props) {

  // ✅ ปิดด้วยปุ่ม ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
        onClick={(e) => e.stopPropagation()} 
        // ✅ กันไม่ให้คลิกที่รูปแล้ว modal ปิด
      />
    </div>
  );
}

