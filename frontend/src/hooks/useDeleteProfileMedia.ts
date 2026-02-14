// frontend/src/hooks/useDeleteProfileMedia.ts

"use client";

import { useState } from "react";
import { deleteProfileMedia } from "@/lib/api/profile-media";
import { useUserStore } from "@/stores/user.store";
import { useAuth } from "@/context/AuthContext";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";

export function useDeleteProfileMedia() {
  const { user } = useUserStore();
  const { refreshUser } = useAuth();
  const currentMedia = useCurrentProfileMedia(user?.id ?? null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (mediaId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await deleteProfileMedia(mediaId);

      // ✅ backend authority → refetch from source of truth
      await refreshUser();
      await currentMedia.refetch();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to delete profile media",
      );
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

