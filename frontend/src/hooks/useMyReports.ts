// frontend/src/hooks/useMyReports.ts

import { useEffect, useState } from "react";
import {
  getMyReports,
  type MyReportItem,
} from "@/lib/api/reports";

export function useMyReports() {
  const [items, setItems] = useState<MyReportItem[]>([]);
  const [nextCursor, setNextCursor] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function loadMore(
    initial: boolean = false,
  ) {
    setLoading(true);
    setError(null);

    try {
      const res = await getMyReports({
        cursor: initial ? null : nextCursor,
      });

      setItems((prev) =>
        initial ? res.items : [...prev, ...res.items],
      );
      setNextCursor(res.nextCursor);
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to load reports",
      );
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    loading,
    error,
    hasMore: Boolean(nextCursor),
    loadMore,
  };
}
