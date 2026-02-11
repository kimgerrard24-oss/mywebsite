// frontend/src/components/profile/CoverClickable.tsx
import React from "react";

type Props = {
  coverUrl?: string | null;
  onClick?: () => void;
};

export function CoverClickable({ coverUrl, onClick }: Props) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className="
        h-24
        sm:h-32
        md:h-40
        w-full
        rounded-t-xl
        sm:rounded-t-2xl
        bg-gray-200
        overflow-hidden
      "
      onClick={() => {
        if (!coverUrl) return;
        onClick?.();
      }}
    >
      {coverUrl && (
        <img
          src={coverUrl}
          alt="Profile cover"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      )}
    </button>
  );
}

