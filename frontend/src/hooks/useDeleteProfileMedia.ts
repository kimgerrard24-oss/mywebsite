// frontend/src/hooks/useDeleteProfileMedia.ts

"use client";

import { useState } from "react";
import { deleteProfileMedia } from "@/lib/api/profile-media";
import { useUserStore } from "@/stores/user.store";

export function useDeleteProfileMedia() {
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    mediaId: string,
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      await deleteProfileMedia(mediaId);
      return true; // 🔥 สำคัญ
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to delete profile media",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProfileMedia: execute,
    loading,
    error,
  };
}


