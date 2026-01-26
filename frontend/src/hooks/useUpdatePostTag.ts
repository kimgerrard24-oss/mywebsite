// frontend/src/hooks/useUpdatePostTag.ts

"use client";

import { useCallback, useState } from "react";
import { updatePostTag, UpdatePostTagAction } from "@/lib/api/post-tags";

export function useUpdatePostTag() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (params: {
      postId: string;
      tagId: string;
      action: UpdatePostTagAction;
    }) => {
      try {
        setLoading(true);
        setError(null);
        return await updatePostTag(params);
      } catch (e) {
        console.error("[useUpdatePostTag] failed", e);
        setError("Unable to update tag");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading, error };
}
