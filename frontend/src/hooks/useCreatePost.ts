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

      // ===== optional (normal post) =====
      mediaIds?: string[];

      // ===== visibility =====
      visibility?: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM";
      includeUserIds?: string[];
      excludeUserIds?: string[];

      // ===== tagging =====
      taggedUserIds?: string[];

      // ===== 🆕 repost =====
      repostOfPostId?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await createPost({
          content: params.content,

          // media
          mediaIds: params.mediaIds,

          // visibility
          visibility: params.visibility,
          includeUserIds: params.includeUserIds,
          excludeUserIds: params.excludeUserIds,

          // tagging
          taggedUserIds: params.taggedUserIds,

          //  repost (pass-through only)
          repostOfPostId: params.repostOfPostId,
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
