// frontend/src/hooks/useBanUser.ts

import { useState } from "react";
import { banUser } from "@/lib/api/admin-ban-user";

export function useBanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function execute(
    userId: string,
    reason: string,
  ): Promise<boolean> {
    if (!reason.trim()) {
      setError("Reason is required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await banUser(userId, { reason });
      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to ban user",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    banUser: execute,
    loading,
    error,
  };
}
