// frontend/src/components/following/FollowingItem.tsx

import { useState } from 'react';
import Link from 'next/link';
import FollowButton from '@/components/follows/FollowButton';
import type { Following } from '@/types/following';

type Props = {
  following: Following;
};

export default function FollowingItem({ following }: Props) {
  // ✅ local UI state (source of truth ยังมาจาก backend)
  const [isFollowing, setIsFollowing] = useState(
    following.isFollowing,
  );

  // 🔒 UX guard only — backend is authority
  const isBlocked =
    following.isBlocked === true ||
    following.hasBlockedViewer === true;

    function getInitial(name?: string | null) {
  if (!name) return "U";
  return name.trim().charAt(0).toUpperCase();
}


  return (
    <li
      className="
        flex
        items-center
        justify-between
        gap-3
        py-2
      "
    >
      {/* ================= User Info ================= */}
      {isBlocked ? (
        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
            opacity-60
            cursor-not-allowed
          "
          aria-label="Blocked user"
        >
          <div
  className="
    h-8
    w-8
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
    flex-shrink-0
  "
  aria-hidden
>
  {following.avatarUrl ? (
    <img
      src={following.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-xs font-semibold text-gray-700">
      {getInitial(following.displayName)}
    </span>
  )}
</div>


          <span
            className="
              text-sm
              font-medium
              text-gray-900
              truncate
            "
          >
            {following.displayName ?? 'Unknown user'}
          </span>
        </div>
      ) : (
        <Link
          href={`/users/${following.userId}`}
          className="flex items-center gap-3 min-w-0 hover:underline"
        >
          <div
  className="
    h-8
    w-8
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
    flex-shrink-0
  "
  aria-hidden
>
  {following.avatarUrl ? (
    <img
      src={following.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-xs font-semibold text-gray-700">
      {getInitial(following.displayName)}
    </span>
  )}
</div>


          <span
            className="
              text-sm
              font-medium
              text-gray-900
              truncate
            "
          >
            {following.displayName ?? 'Unknown user'}
          </span>
        </Link>
      )}

      {/* ================= Follow Button ================= */}
      {!isBlocked && following.canFollow && (
        <FollowButton
          userId={following.userId}
          isFollowing={isFollowing}
          onFollowed={() => setIsFollowing(true)}
        />
      )}
    </li>
  );
}
