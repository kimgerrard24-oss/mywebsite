// frontend/src/components/reposts/UndoRepostButton.tsx
import { useState } from 'react';
import { undoRepost } from '@/lib/api/reposts';

type Props = {
  postId: string;
  onUndone?: (next: {
    hasReposted: false;
    repostCount: number;
  }) => void;
};

export default function UndoRepostButton({ postId, onUndone }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUndo() {
    if (loading) return;

    setLoading(true);
    try {
      const result = await undoRepost(postId);

onUndone?.({
  hasReposted: false,
  repostCount: result.repostCount,
});

    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleUndo}
      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
    >
      ↩ ยกเลิกรีโพสต์
    </button>
  );
}
