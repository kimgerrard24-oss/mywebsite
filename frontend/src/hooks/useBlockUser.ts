// frontend/src/hooks/useBlockUser.ts

import { useState } from "react";
import { blockUser } from "@/lib/api/user";

export function useBlockUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function submit(userId: string) {
    setLoading(true);
    setError(null);

    try {
      await blockUser(userId);
      return { ok: true as const };
    } catch (err: any) {
      const msg =
        err?.body?.message ??
        err?.message ??
        "Failed to block user";

      setError(msg);
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
  };
}
