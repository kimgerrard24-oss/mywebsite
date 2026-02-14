// frontend/src/hooks/useProfileUpdatePublish.ts

"use client";

import { useState } from "react";
import { publishProfileUpdate } from "@/lib/api/profile-update";
import type { PublishDraftRequest } from "@/types/profile-update";

export function useProfileUpdatePublish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async (payload: PublishDraftRequest) => {
    try {
      setLoading(true);
      setError(null);

      return await publishProfileUpdate(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Publish failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading, error };
}
