// frontend/src/components/posts/RepostButton.tsx
import { useState } from 'react';
import { repostPost } from '@/lib/api/reposts';

type Props = {
  postId: string;
  onReposted?: (next: {
    hasReposted: true;
    repostCount: number;
  }) => void;
};

export default function RepostButton({ postId, onReposted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRepost() {
    if (loading) return;

    setLoading(true);
    try {
      const result = await repostPost(postId);

onReposted?.({
  hasReposted: true,
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
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
    >
      🔁 Repost
    </button>
  );
}
