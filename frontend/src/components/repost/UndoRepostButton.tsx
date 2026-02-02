// frontend/src/components/reposts/UndoRepostButton.tsx

import { useState } from 'react';
import { deleteRepost } from '@/lib/api/reposts';

type Props = {
  postId: string;

  /**
   * current repost count (for optimistic update)
   */
  repostCount: number;

  /**
   * callback หลัง undo สำเร็จ
   */
  onUndone?: (next: {
    reposted: false;
    repostCount: number;
  }) => void;
};

export default function UndoRepostButton({
  postId,
  repostCount,
  onUndone,
}: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (loading) return;

        setLoading(true);

        try {
          await deleteRepost(postId);

          onUndone?.({
            reposted: false,
            repostCount: Math.max(0, repostCount - 1),
          });
        } finally {
          setLoading(false);
        }
      }}
      className={`
        inline-flex
        items-center
        gap-1
        text-sm
        font-medium
        text-blue-600
        hover:text-blue-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition
      `}
      aria-label="Undo repost"
      title="ยกเลิกการรีโพสต์"
    >
      ↩ ยกเลิกรีโพสต์
    </button>
  );
}
