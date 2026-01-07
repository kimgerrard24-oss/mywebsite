// frontend/src/hooks/useMyBlockedUsers.ts

import { useEffect, useState } from "react";
import { getMyBlockedUsersClient } from "@/lib/api/user";

type BlockedUserItem = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
};

export function useMyBlockedUsers(initialData?: {
  items: BlockedUserItem[];
  nextCursor: string | null;
}) {
  const [items, setItems] = useState<BlockedUserItem[]>(
    initialData?.items ?? [],
  );
  const [cursor, setCursor] = useState<string | null>(
    initialData?.nextCursor ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function loadMore(initial = false) {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getMyBlockedUsersClient({
        cursor: initial ? null : cursor,
      });

      setItems((prev) =>
        initial ? res.items : [...prev, ...res.items],
      );
      setCursor(res.nextCursor);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to load blocked users",
      );
    } finally {
      setLoading(false);
    }
  }

  // initial CSR load (ถ้า SSR ไม่ได้ส่ง initialData มา)
  useEffect(() => {
    if (!initialData) {
      loadMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    loading,
    error,
    hasMore: Boolean(cursor),
    loadMore,
  };
}
