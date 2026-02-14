// frontend/src/hooks/useCoverUpdatePublish.ts

"use client";

import { useState } from "react";
import { publishCoverUpdate } from "@/lib/api/cover-update";

export function useCoverUpdatePublish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    try {
      setLoading(true);
      setError(null);

      return await publishCoverUpdate();
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
