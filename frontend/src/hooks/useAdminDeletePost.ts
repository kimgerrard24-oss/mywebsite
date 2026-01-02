// frontend/src/hooks/useAdminDeletePost.ts

import { useState } from "react";
import { adminDeletePost } from "@/lib/api/admin-delete-post";

export function useAdminDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function execute(
    postId: string,
    reason: string,
  ): Promise<boolean> {
    if (!reason.trim()) {
      setError("Reason is required");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await adminDeletePost(postId, {
        reason,
      });
      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to delete post",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    deletePost: execute,
    loading,
    error,
  };
}
