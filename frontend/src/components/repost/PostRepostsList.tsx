// frontend/src/components/reposts/PostRepostsList.tsx

import { useEffect, useState } from 'react';
import { getPostReposts } from '@/lib/api/reposts';
import type { RepostUserItem } from '@/types/repost';

type Props = {
  postId: string;
};

export default function PostRepostsList({ postId }: Props) {
  const [items, setItems] = useState<RepostUserItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  async function loadMore() {
    if (loading) return;

    setLoading(true);
    try {
      const res = await getPostReposts(postId, {
        cursor: nextCursor ?? undefined,
        limit: 20,
      });

      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }

  // initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!initialLoaded && loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        กำลังโหลด…
      </div>
    );
  }

  if (initialLoaded && items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        ยังไม่มีการ repost
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => (
        <div
          key={item.userId + item.repostedAt}
          className="flex items-center gap-3 p-3"
        >
          <img
            src={item.avatarUrl ?? '/avatar-placeholder.png'}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {item.displayName ?? 'ผู้ใช้'}
            </div>
            <div className="text-xs text-gray-500">
              repost เมื่อ{' '}
              {new Date(item.repostedAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}

      {nextCursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="w-full p-3 text-sm text-blue-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด…' : 'โหลดเพิ่มเติม'}
        </button>
      )}
    </div>
  );
}
