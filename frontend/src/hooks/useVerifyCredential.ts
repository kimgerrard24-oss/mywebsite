// frontend/src/hooks/useVerifyCredential.ts

import { useState, useCallback } from "react";
import { verifyCredential } from "@/lib/api/user";

export function useVerifyCredential() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      await verifyCredential(password);
      return true;
    } catch (err: any) {
      const msg =
        err?.body?.message ||
        err?.message ||
        "Verification failed";

      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submit,
    loading,
    error,
  };
}
