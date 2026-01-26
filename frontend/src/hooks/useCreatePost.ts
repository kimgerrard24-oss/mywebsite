// frontend/src/hooks/useCreatePost.ts
"use client";

import { useCallback, useState } from "react";
import { createPost } from "@/lib/api/posts";

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (params: {
      content: string;
      mediaIds?: string[];
      visibility?: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM";
      includeUserIds?: string[];
      excludeUserIds?: string[];
      taggedUserIds?: string[];
    }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await createPost({
  content: params.content,
  mediaIds: params.mediaIds,
  visibility: params.visibility,
  includeUserIds: params.includeUserIds,
  excludeUserIds: params.excludeUserIds,
  taggedUserIds: params.taggedUserIds,
});


        return res;
      } catch (err) {
        console.error("Create post failed:", err);
        setError("ไม่สามารถโพสต์ได้ กรุณาลองใหม่");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    submit,
    loading,
    error,
  };
}
