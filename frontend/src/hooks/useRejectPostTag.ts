// frontend/src/hooks/useRejectPostTag.ts

"use client";

import { useState, useCallback } from "react";
import { rejectPostTag } from "@/lib/api/post-tags-reject";

export function useRejectPostTag() {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (params: { postId: string; tagId: string }) => {
      setLoading(true);
      try {
        return await rejectPostTag(params);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading };
}
