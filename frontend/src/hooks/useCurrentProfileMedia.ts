// frontend/src/hooks/useCurrentProfileMedia.ts

import { useEffect, useState } from "react";
import { getCurrentProfileMedia } from "@/lib/api/profile-media-current";
import type {
  GetCurrentProfileMediaResponse,
} from "@/types/profile-media-current";

export function useCurrentProfileMedia(userId: string | null) {
  const [data, setData] =
    useState<GetCurrentProfileMediaResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!userId) {
    setData(null);
    return;
  }

  let isMounted = true;

  async function load(validUserId: string) {
    try {
      setLoading(true);
      setError(null);

      const result = await getCurrentProfileMedia(validUserId);

      if (isMounted) {
        setData(result);
      }
    } catch (err: any) {
      if (!isMounted) return;

      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : "ไม่สามารถโหลดรูปโปรไฟล์ได้";

      setError(message);
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  void load(userId);

  return () => {
    isMounted = false;
  };
}, [userId]);


  return {
    data,
    loading,
    error,
  };
}
