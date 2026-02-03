// frontend/src/components/posts/RepostButton.tsx
import { useState } from 'react';
import { createRepost } from '@/lib/api/reposts';

type Props = {
  postId: string;
  onReposted?: (result: {
    repostId: string;
    createdAt: string;
    repostCount: number;
  }) => void;
};

export default function RepostButton({ postId, onReposted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRepost() {
    if (loading) return;

    setLoading(true);

    try {
      const result = await createRepost(postId);

      onReposted?.({
        repostId: result.repostId,
        createdAt: result.createdAt,
        repostCount: result.repostCount, 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRepost}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-100"
    >
      🔁 Repost
    </button>
  );
}
