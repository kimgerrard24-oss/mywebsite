// frontend/src/hooks/useBanUser.ts

import { useState } from "react";
import {
  banUser as banUserApi,
  unbanUser as unbanUserApi,
} from "@/lib/api/admin-ban-user";

export function useBanUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  /**
   * ==============================
   * Ban user
   * ==============================
   */
  async function banUser(
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
      await banUserApi(userId, { reason });
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

  /**
   * ==============================
   * Unban user
   * ==============================
   */
  async function unbanUser(
    userId: string,
  ): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await unbanUserApi(userId);
      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to unban user",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    banUser,
    unbanUser,
    loading,
    error,
  };
}
