// frontend/src/components/ui/Avatar.tsx

import { useState } from "react";

type Props = {
  avatarUrl?: string | null;
  name?: string | null;
  size?: number; // px
  className?: string;
};

export default function Avatar({
  avatarUrl,
  name,
  size = 32,
  className = "",
}: Props) {
  const [error, setError] = useState(false);

  const hasImage =
    Boolean(avatarUrl && avatarUrl.trim().length > 0) &&
    !error;

  const initial =
    name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={`
        rounded-full overflow-hidden bg-gray-200
        flex items-center justify-center flex-shrink-0
        ${className}
      `}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {hasImage ? (
        <img
          src={avatarUrl!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      ) : (
        <span
          className="font-semibold text-gray-700"
          style={{ fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

