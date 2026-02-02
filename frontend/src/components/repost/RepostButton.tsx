// frontend/src/components/posts/RepostButton.tsx

import { useState } from 'react';
import { createRepost } from '@/lib/api/reposts';

type Props = {
  postId: string;
  onReposted?: (result: {
    repostId: string;
    createdAt: string;
  }) => void;
};

export default function RepostButton({
  postId,
  onReposted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRepost() {
    if (loading || done) return;

    setLoading(true);

    try {
      const result = await createRepost(postId);

      setDone(true);
      onReposted?.({
        repostId: result.repostId,
        createdAt: result.createdAt,
      });
    } catch {
      // ❗ backend is authority
      // error handling / toast สามารถใส่เพิ่มภายหลังได้
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRepost}
      disabled={loading || done}
      aria-disabled={loading || done}
      title={done ? 'คุณ repost โพสต์นี้แล้ว' : 'Repost'}
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-md
        px-2.5
        py-1.5
        text-xs
        sm:text-sm
        font-medium
        border
        transition
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500

        ${
          done
            ? 'border-green-400 text-green-600 bg-green-50'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }

        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span aria-hidden="true">🔁</span>
      {done ? 'Reposted' : 'Repost'}
    </button>
  );
}
