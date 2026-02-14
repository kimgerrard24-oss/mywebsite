// frontend/src/hooks/useCoverUpdatePublish.ts

"use client";

import { useState } from "react";
import { publishCoverUpdate } from "@/lib/api/cover-update";

export function useCoverUpdatePublish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await publishCoverUpdate();
      return res.postId;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Publish failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading, error };
}
