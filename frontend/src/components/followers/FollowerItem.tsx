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

    function getInitial(name?: string | null) {
  if (!name) return "U";
  return name.trim().charAt(0).toUpperCase();
}


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
  {follower.avatarUrl ? (
    <img
      src={follower.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-xs font-semibold text-gray-700">
      {getInitial(follower.displayName)}
    </span>
  )}
</div>


          <span className="text-sm font-medium text-gray-900">
            {follower.displayName ?? 'Unknown user'}
          </span>
        </div>
      ) : (
        <Link
          href={`/users/${follower.userId}`}
          className="flex items-center gap-3 hover:underline"
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
  {follower.avatarUrl ? (
    <img
      src={follower.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-xs font-semibold text-gray-700">
      {getInitial(follower.displayName)}
    </span>
  )}
</div>


          <span className="text-sm font-medium text-gray-900">
            {follower.displayName ?? 'Unknown user'}
          </span>
        </Link>
      )}
    </li>
  );
}
