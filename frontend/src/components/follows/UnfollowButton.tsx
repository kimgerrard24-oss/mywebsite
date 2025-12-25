// frontend/src/components/follows/UnfollowButton.tsx

import type { MouseEvent } from 'react';
import { useUnfollowUser } from '@/hooks/useUnfollowUser';

type Props = {
  userId: string;
  isFollowing: boolean;

  onUnfollowed?: () => void;
};

export default function UnfollowButton({
  userId,
  isFollowing,
  onUnfollowed,
}: Props) {
  const { unfollow, loading, error } = useUnfollowUser({
  userId,
  initialIsFollowing: isFollowing,
});


  async function handleClick(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    if (loading || !isFollowing) return;

    try {
      await unfollow();

      // ✅ backend เป็นผู้ตัดสินจริง
      onUnfollowed?.();
    } catch {
      // fail-soft: ไม่เปลี่ยน UI
    }
  }

  // ✅ render เฉพาะตอน follow อยู่
  if (!isFollowing) {
    return null;
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
