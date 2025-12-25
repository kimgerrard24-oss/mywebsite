// frontend/src/components/follows/FollowButton.tsx

import type { MouseEvent } from 'react';
import { useFollowUser } from '@/hooks/useFollowUser';

type Props = {
  userId: string;
  isFollowing: boolean;

  // ✅ เพิ่ม: แจ้ง parent เมื่อ follow สำเร็จ
  onFollowed?: () => void;
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
  } = useFollowUser({
    userId,
    initialIsFollowing: isFollowing, // ใช้เพื่อกัน UX กระพริบเท่านั้น
  });

  async function handleClick(
  e: MouseEvent<HTMLButtonElement>
) {
  e.preventDefault();
  if (loading || isFollowing) return;

  try {
    await follow();
    onFollowed?.();
  } catch {
    // fail-soft: backend คือ authority
  }
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
            ? 'bg-gray-200 text-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-60
      `}
    >
      {loading
        ? 'Following…'
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
