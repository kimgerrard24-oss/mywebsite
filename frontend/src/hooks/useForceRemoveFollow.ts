// frontend/src/hooks/useForceRemoveFollow.ts

"use client";

import { useState } from "react";
import {
  forceRemoveFollow,
  type ForceRemoveFollowReason,
} from "@/lib/api/admin-follows-moderation";

export function useForceRemoveFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [success, setSuccess] = useState(false);

  async function submit(params: {
    followId: string;
    reason: ForceRemoveFollowReason;
    note?: string;
  }) {
    if (loading) return false;

    setLoading(true);
    setError(null);

    try {
      await forceRemoveFollow(params.followId, {
        reason: params.reason,
        note: params.note,
      });

      setSuccess(true);
      return true;
    } catch (err: any) {
      if (err?.status === 401) {
        setError("Unauthorized");
      } else if (err?.status === 403) {
        setError("Forbidden");
      } else if (err?.status === 404) {
        setError("Follow not found");
      } else {
        setError("Force remove failed");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
    success,
  };
}
