// frontend/src/components/followers/FollowerItem.tsx

import Link from 'next/link';
import type { Follower } from '@/types/follower';

type Props = {
  follower: Follower;
};

export default function FollowerItem({ follower }: Props) {
  // 🔒 UX guard only — backend is authority
  const isBlocked =
    follower.isBlocked === true ||
    follower.hasBlockedViewer === true;

  return (
    <li className="flex items-center gap-3 py-2">
      {isBlocked ? (
        <div
          className="
            flex
            items-center
            gap-3
            opacity-60
            cursor-not-allowed
          "
          aria-label="Blocked user"
        >
          {follower.avatarUrl ? (
            <img
              src={follower.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full"
              loading="lazy"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-full bg-gray-300"
              aria-hidden="true"
            />
          )}

          <span className="text-sm font-medium text-gray-900">
            {follower.displayName ?? 'Unknown user'}
          </span>
        </div>
      ) : (
        <Link
          href={`/users/${follower.userId}`}
          className="flex items-center gap-3 hover:underline"
        >
          {follower.avatarUrl ? (
            <img
              src={follower.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full"
              loading="lazy"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-full bg-gray-300"
              aria-hidden="true"
            />
          )}

          <span className="text-sm font-medium text-gray-900">
            {follower.displayName ?? 'Unknown user'}
          </span>
        </Link>
      )}
    </li>
  );
}
