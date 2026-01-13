// frontend/src/hooks/useUpdateUsername.ts

import { useState, useCallback } from "react";
import { updateMyUsername } from "@/lib/api/user";

export function useUpdateUsername() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateMyUsername(username);
      return res;
    } catch (err: any) {
      const msg =
        err?.body?.message ||
        err?.message ||
        "Failed to update username";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}
