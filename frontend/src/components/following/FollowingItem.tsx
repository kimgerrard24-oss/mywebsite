// frontend/src/components/following/FollowingItem.tsx

import Link from 'next/link';
import FollowButton from '@/components/follows/FollowButton';
import type { Following } from '@/types/following';

type Props = {
  following: Following;
};

export default function FollowingItem({ following }: Props) {
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
      <Link
        href={`/users/${following.userId}`}
        className="flex items-center gap-3 min-w-0"
      >
        {following.avatarUrl ? (
          <img
            src={following.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="h-8 w-8 rounded-full bg-gray-300"
            aria-hidden="true"
          />
        )}

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

      {/* ================= Follow Button ================= */}
      {following.canFollow && (
        <FollowButton
          userId={following.userId}
          isFollowing={following.isFollowing}
        />
      )}
    </li>
  );
}
