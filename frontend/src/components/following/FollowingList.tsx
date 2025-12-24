// frontend/src/components/following/FollowingList.tsx

import FollowingItem from './FollowingItem';
import { useFollowing } from '@/hooks/useFollowing';

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
      {/* ================= List ================= */}
      <ul className="divide-y divide-gray-200">
        {items.map((following) => (
          <FollowingItem
            key={following.userId}
            following={following}
          />
        ))}
      </ul>

      {/* ================= Empty ================= */}
      {!loading && items.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          This user is not following anyone yet.
        </p>
      )}

      {/* ================= Error ================= */}
      {error && (
        <p
          className="mt-3 text-sm text-red-600"
          role="alert"
        >
          Failed to load following list
        </p>
      )}

      {/* ================= Pagination ================= */}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="
            mt-4
            w-full
            rounded-md
            border
            px-4
            py-2
            text-sm
            font-medium
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
