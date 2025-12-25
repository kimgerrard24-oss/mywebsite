// frontend/src/components/follows/FollowButton.tsx

import type { MouseEvent } from 'react';
import { useFollowUser } from '@/hooks/useFollowUser';

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
    loading,
    error,
  } = useFollowUser(userId);

  async function handleClick(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    // ป้องกัน double action และ state ซ้อน
    if (loading || isFollowing) return;

    try {
      await follow();
      onFollowed?.(true);
    } catch {
      // fail-soft
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
            ? 'bg-gray-200 text-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {loading ? 'Following…' : 'Follow'}

      {error && (
        <span className="sr-only">
          Follow error: {error}
        </span>
      )}
    </button>
  );
}
