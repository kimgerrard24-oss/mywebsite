// frontend/src/hooks/useMediaComplete.ts
import { useCallback, useState } from "react";
import {
  completeMediaUpload,
  type MediaCompleteRequest,
} from "@/lib/api/media-complete";

export function useMediaComplete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(
    async (payload: MediaCompleteRequest): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const res = await completeMediaUpload(payload);
        return res.mediaId;
      } catch (err) {
        console.error("Media complete failed:", err);
        setError("ไม่สามารถยืนยันไฟล์ได้ กรุณาลองใหม่");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    complete,
    loading,
    error,
  };
}
