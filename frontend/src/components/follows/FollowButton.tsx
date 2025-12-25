// frontend/src/components/follows/FollowButton.tsx

import type { MouseEvent } from 'react';
import { useFollowUser } from '@/hooks/useFollowUser';
import { useUnfollowUser } from '@/hooks/useUnfollowUser';

type Props = {
  userId: string;
  isFollowing: boolean;

  // แจ้ง parent เมื่อสถานะเปลี่ยน (fail-soft)
  onFollowed?: (isFollowing: boolean) => void;
};

export default function FollowButton({
  userId,
  isFollowing,
  onFollowed,
}: Props) {
  const {
    follow,
    loading: followLoading,
    error: followError,
  } = useFollowUser({
    userId,
    initialIsFollowing: isFollowing,
  });

  const {
    unfollow,
    loading: unfollowLoading,
    error: unfollowError,
  } = useUnfollowUser({
    userId,
  });

  const loading = followLoading || unfollowLoading;
  const error = followError || unfollowError;

  async function handleClick(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    if (loading) return;

    try {
      if (isFollowing) {
        await unfollow();
        onFollowed?.(false);
      } else {
        await follow();
        onFollowed?.(true);
      }
    } catch {
      // fail-soft: backend คือ authority
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isFollowing}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        rounded-full px-4 py-1.5 text-sm font-medium
        transition
        ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {loading
        ? isFollowing
          ? 'Unfollowing…'
          : 'Following…'
        : isFollowing
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
