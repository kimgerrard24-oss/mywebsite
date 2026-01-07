// frontend/src/hooks/useUnblockUser.ts

import { useState } from "react";
import { unblockUser } from "@/lib/api/user";

export function useUnblockUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function submit(userId: string) {
    if (loading) return { ok: false as const };

    setLoading(true);
    setError(null);

    try {
      await unblockUser(userId);
      return { ok: true as const };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.body?.message ??
        "Failed to unblock user";

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
