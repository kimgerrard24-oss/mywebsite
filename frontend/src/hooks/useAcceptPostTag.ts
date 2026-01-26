// frontend/src/hooks/useAcceptPostTag.ts

"use client";

import { useState, useCallback } from "react";
import { acceptPostTag } from "@/lib/api/post-tags-accept";

export function useAcceptPostTag() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (params: { postId: string; tagId: string }) => {
      setLoading(true);
      setError(null);

      try {
        return await acceptPostTag(params);
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading, error };
}
