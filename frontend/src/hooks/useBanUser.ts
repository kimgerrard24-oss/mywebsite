// frontend/src/hooks/useBanUser.ts

import { useState } from "react";
import { banUser as banUserApi } from "@/lib/api/admin-ban-user";

export function useBanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function execute(params: {
    userId: string;
    isDisabled: boolean;
    reason?: string;
  }): Promise<boolean> {
    const { userId, isDisabled, reason } = params;

    // Ban requires reason
    if (!isDisabled && (!reason || !reason.trim())) {
      setError("Reason is required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await banUserApi(userId, {
        banned: isDisabled ? false : true,
        reason: isDisabled ? undefined : reason?.trim(),
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
