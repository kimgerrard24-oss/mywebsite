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
  const {
    isFollowing: following,
    follow,
    loading,
    error,
  } = useFollowUser({
    userId,
    initialIsFollowing: isFollowing,
  });

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (loading) return;
    follow();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={following}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        rounded-full px-4 py-1.5 text-sm font-medium
        transition
        ${
          following
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {loading
        ? following
          ? 'Unfollowing…'
          : 'Following…'
        : following
          ? 'Following'
          : 'Follow'}

      {error && (
        <span className="sr-only">
          Follow error: {error}
        </span>
      )}
    </button>
  );
}
