// frontend/src/hooks/useSetCurrentProfileMedia.ts

import { useState } from "react";
import { setCurrentProfileMedia } from "@/lib/api/profile-media-set-current";
import { useUserStore } from "@/stores/user.store";
import type { ProfileMediaType } from "@/types/set-current-profile-media";

export function useSetCurrentProfileMedia() {
  const { updateAvatar, updateCover } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setCurrent(
    mediaId: string,
    type: ProfileMediaType,
  ) {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await setCurrentProfileMedia(mediaId, { type });

      // Sync store (no reload)
      if (result.type === "AVATAR") {
        updateAvatar(result.url);
      }

      if (result.type === "COVER") {
        updateCover(result.url);
      }

      return result;
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "เกิดข้อผิดพลาด";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    setCurrent,
    loading,
    error,
  };
}
