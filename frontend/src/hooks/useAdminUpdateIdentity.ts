// frontend/src/hooks/useAdminUpdateIdentity.ts

import { useState } from "react";
import { adminUpdateUserIdentity } from "@/lib/api/admin-identity";
import type {
  AdminUpdateIdentityPayload,
} from "@/types/admin-identity";

export function useAdminUpdateIdentity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  async function submit(
    userId: string,
    payload: AdminUpdateIdentityPayload,
  ) {
    try {
      setLoading(true);
      setError(null);

      await adminUpdateUserIdentity(userId, payload);

      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ||
          "Update failed",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}
