// frontend/src/components/followers/FollowersList.tsx

import FollowerItem from './FollowerItem';
import { useFollowers } from '@/hooks/useFollowers';

type Props = {
  userId: string;
};

export default function FollowersList({ userId }: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
  } = useFollowers({ userId });

  return (
    <section aria-label="Followers">
      <ul className="divide-y divide-gray-200">
        {items.map((follower) => (
          <FollowerItem
            key={follower.userId}
            follower={follower}
          />
        ))}
      </ul>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load followers
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
