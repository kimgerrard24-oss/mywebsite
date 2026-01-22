// frontend/src/hooks/useModerationOverrideVisibility.ts

"use client";

import { useState } from "react";
import { overridePostVisibility } from "@/lib/api/moderation";

export function useModerationOverrideVisibility(postId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function override(params: {
    visibility: "PUBLIC" | "PRIVATE";
    reason: string;
  }) {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      return await overridePostVisibility({
        postId,
        visibility: params.visibility,
        reason: params.reason,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to override post visibility.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    override,
    loading,
    error,
  };
}

