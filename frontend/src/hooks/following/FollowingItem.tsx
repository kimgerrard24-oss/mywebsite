// frontend/components/following/FollowingItem.tsx

import Link from 'next/link';
import type { FollowingUser } from '@/types/following';

type Props = {
  user: FollowingUser;
};

export default function FollowingItem({ user }: Props) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Link
        href={`/users/${user.userId}`}
        className="flex items-center gap-3"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        )}

        <span className="text-sm font-medium text-gray-900">
          {user.displayName ?? 'Unknown user'}
        </span>
      </Link>
    </li>
  );
}
