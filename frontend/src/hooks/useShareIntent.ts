// frontend/src/hooks/useShareIntent.ts

import { useCallback, useState } from "react";
import { checkShareIntent, ShareIntentResult } from "@/lib/api/shares";

export function useShareIntent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShareIntentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await checkShareIntent(postId);
      setResult(res);
      return res;
    } catch (err) {
      setError("FAILED_TO_CHECK_SHARE_INTENT");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkShareIntent: check,
    loading,
    result,
    error,
    reset: () => {
      setResult(null);
      setError(null);
    },
  };
}
