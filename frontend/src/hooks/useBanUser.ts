// frontend/src/hooks/useBanUser.ts

import { useState } from "react";
import { banUser as banUserApi } from "@/lib/api/admin-ban-user";

export function useBanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function execute(params: {
    userId: string;
    banned: boolean;
    reason?: string;
  }): Promise<boolean> {
    const { userId, banned, reason } = params;

    const trimmedReason =
      typeof reason === "string" ? reason.trim() : "";

    // Ban requires reason (UX validation only)
    if (banned && trimmedReason.length === 0) {
      setError("Reason is required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await banUserApi(userId, {
        banned,
        reason: banned ? trimmedReason : undefined,
      });
      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to update user status",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    execute,
    loading,
    error,
  };
}
