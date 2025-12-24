// frontend/components/following/FollowingList.tsx

import { useFollowing } from '@/hooks/useFollowing';
import FollowingItem from './FollowingItem';

type Props = {
  userId: string;
};

export default function FollowingList({ userId }: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
  } = useFollowing({ userId });

  return (
    <section aria-label="Following">
      <ul className="divide-y divide-gray-200">
        {items.map((user) => (
          <FollowingItem
            key={user.userId}
            user={user}
          />
        ))}
      </ul>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load following
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="
            mt-4 w-full rounded-md
            border px-4 py-2
            text-sm font-medium
            hover:bg-gray-50
            disabled:opacity-60
          "
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </section>
  );
}
