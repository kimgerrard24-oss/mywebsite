// frontend/src/hooks/usePostShareStats.ts

import { useCallback, useEffect, useState } from "react";
import { getPostShareStats, PostShareStats } from "@/lib/api/post-share-stats";

export function usePostShareStats(postId: string) {
  const [stats, setStats] = useState<PostShareStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPostShareStats(postId);
      setStats(res);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    load();
  }, [postId, load]);

  return {
    stats,
    loading,
    error,
    reload: load,
  };
}
