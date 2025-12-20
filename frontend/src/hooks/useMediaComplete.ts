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
        // Defensive validation (fail-fast, production-safe)
        if (
          !payload.objectKey ||
          typeof payload.objectKey !== "string"
        ) {
          throw new Error("Invalid objectKey");
        }

        if (
          payload.mediaType !== "image" &&
          payload.mediaType !== "video"
        ) {
          throw new Error("Invalid mediaType");
        }

        if (
          !payload.mimeType ||
          typeof payload.mimeType !== "string" ||
          payload.mimeType.length > 255
        ) {
          throw new Error("Invalid mimeType");
        }

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
