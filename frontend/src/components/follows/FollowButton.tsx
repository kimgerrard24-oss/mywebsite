// frontend/src/components/follows/FollowButton.tsx

import type { MouseEvent } from 'react';
import { useFollowUser } from '@/hooks/useFollowUser';

type Props = {
  userId: string;
  isFollowing: boolean;
};

export default function FollowButton({
  userId,
  isFollowing,
}: Props) {
  const { follow, loading, error } = useFollowUser({
    userId,
    initialIsFollowing: isFollowing,
  });

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    follow();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || isFollowing}
      aria-pressed={isFollowing}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        rounded-full px-4 py-1.5 text-sm font-medium
        transition
        ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 cursor-default'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {isFollowing ? 'Following' : loading ? 'Following…' : 'Follow'}
      {error && (
        <span className="sr-only">
          Follow error: {error}
        </span>
      )}
    </button>
  );
}
