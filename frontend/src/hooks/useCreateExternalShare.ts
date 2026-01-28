// frontend/src/hooks/useCreateExternalShare.ts

import { useState } from "react";
import { createExternalShare } from "@/lib/api/shares";

export function useCreateExternalShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await createExternalShare(postId);
      return res;
    } catch (err) {
      setError("Failed to create share link");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createExternalShare: create,
    loading,
    error,
  };
}
