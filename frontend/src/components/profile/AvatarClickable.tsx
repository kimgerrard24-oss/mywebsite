// frontend/src/components/profile/AvatarClickable.tsx

import React from "react";

type Props = {
  avatarUrl?: string | null;
  displayName: string;
  onClick?: () => void;
};

export function AvatarClickable({
  avatarUrl,
  displayName,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100"
      onClick={() => {
        if (!avatarUrl) return;
        onClick?.();
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xl sm:text-2xl font-semibold text-gray-500">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </button>
  );
}

