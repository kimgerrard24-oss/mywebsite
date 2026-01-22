// frontend/src/hooks/usePostPrivacy.ts

import { useState, useCallback } from "react";
import { updateMyPostPrivacy } from "@/lib/api/user-privacy";

export function usePostPrivacy(initial: boolean) {
  const [isPrivate, setIsPrivate] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    if (loading) return;

    const next = !isPrivate;

    setLoading(true);
    setError(null);

    try {
      const res = await updateMyPostPrivacy(next);

      if (res && typeof res.isPrivate === "boolean") {
        setIsPrivate(res.isPrivate); // backend authority
      }
    } catch {
      setError("Unable to update privacy setting. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isPrivate, loading]);

  return {
    isPrivate,
    loading,
    error,
    toggle,
  };
}
