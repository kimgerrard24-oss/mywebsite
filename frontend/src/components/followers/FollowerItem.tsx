// frontend/src/components/followers/FollowerItem.tsx

import Link from 'next/link';
import type { Follower } from '@/types/follower';

type Props = {
  follower: Follower;
};

export default function FollowerItem({ follower }: Props) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Link
        href={`/users/${follower.userId}`}
        className="flex items-center gap-3"
      >
        {follower.avatarUrl ? (
          <img
            src={follower.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        )}

        <span className="text-sm font-medium text-gray-900">
          {follower.displayName ?? 'Unknown user'}
        </span>
      </Link>
    </li>
  );
}
