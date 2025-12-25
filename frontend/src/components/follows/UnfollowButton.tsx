// frontend/src/components/follows/UnfollowButton.tsx

import type { MouseEvent } from 'react';
import { useUnfollowUser } from '@/hooks/useUnfollowUser';

type Props = {
  userId: string;
  isFollowing: boolean;
};

export default function UnfollowButton({
  userId,
  isFollowing,
}: Props) {
  const { unfollow, loading, error } = useUnfollowUser({
    userId,
    initialIsFollowing: isFollowing,
  });

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    unfollow();
  }

  if (!isFollowing) {
    return null; // ไม่ render ถ้ายังไม่ได้ follow
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      className="
        inline-flex items-center justify-center
        rounded-full px-4 py-1.5
        text-sm font-medium
        bg-gray-200 text-gray-700
        hover:bg-gray-300
        transition
        disabled:opacity-60
      "
    >
      {loading ? 'Unfollowing…' : 'Following'}

      {error && (
        <span className="sr-only">
          Unfollow error: {error}
        </span>
      )}
    </button>
  );
}
