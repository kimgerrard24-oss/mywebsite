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
  const {
    unfollow,
    loading,
    error,
  } = useUnfollowUser({
    userId,
  });

  async function handleClick(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    // ป้องกัน double action และ state ซ้อน
    if (loading || !isFollowing) return;

    try {
      await unfollow();

      // ✅ เปลี่ยน state หลัง backend สำเร็จจริงเท่านั้น
      onUnfollowed?.();
    } catch {
      // fail-soft: backend เป็น authority
    }
  }

  // render เฉพาะตอน follow อยู่
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
