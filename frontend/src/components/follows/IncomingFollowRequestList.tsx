// frontend/src/components/follows/IncomingFollowRequestList.tsx

'use client';

import { useIncomingFollowRequests } from '@/hooks/useIncomingFollowRequests';
import IncomingFollowRequestItem from './IncomingFollowRequestItem';
import { useState } from 'react';

export default function IncomingFollowRequestList() {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
  } = useIncomingFollowRequests();

  const [removed, setRemoved] = useState<
    Set<string>
  >(new Set());

  if (error) {
    return (
      <section className="p-4 text-sm text-red-600">
        Failed to load follow requests
      </section>
    );
  }

  const visible = items.filter(
    (i) => !removed.has(i.id),
  );

  function markRemoved(id: string) {
    setRemoved((s) => new Set(s).add(id));
  }

  return (
    <section className="p-4">
      <h2 className="mb-3 text-sm font-semibold">
        Follow Requests
      </h2>

      {visible.length === 0 &&
        !loading && (
          <p className="text-sm text-zinc-500">
            No incoming requests
          </p>
        )}

      <ul className="space-y-3">
        {visible.map((r) => (
          <li key={r.id}>
            <IncomingFollowRequestItem
              request={r}
              onApproved={markRemoved}
              onRejected={markRemoved}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="
              rounded-lg border px-4 py-2 text-sm
              hover:bg-zinc-100
              disabled:opacity-50
            "
          >
            {loading
              ? 'Loading…'
              : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
}


