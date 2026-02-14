// frontend/src/hooks/useProfileUpdatePublish.ts

"use client";

import { useState } from "react";
import { publishProfileUpdate } from "@/lib/api/profile-update";

export function useProfileUpdatePublish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    try {
      setLoading(true);
      setError(null);

      return await publishProfileUpdate();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to publish",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading, error };
}

