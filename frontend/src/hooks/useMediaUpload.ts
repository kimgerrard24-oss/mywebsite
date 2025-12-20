// frontend/src/hooks/useMediaUpload.ts
import { useCallback, useState } from "react";
import {
  requestPresignValidate,
  buildPresignValidatePayload,
} from "@/lib/api/media";

export type UploadResult = {
  objectKey: string;
};

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setUploading(true);
      setError(null);

      try {
        // 1️⃣ Build payload (guaranteed to match backend DTO)
        const payload = buildPresignValidatePayload(file);

        // 2️⃣ ขอ presigned URL
        const { uploadUrl, objectKey } =
          await requestPresignValidate(payload);

        // 3️⃣ upload ตรงไป R2
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": payload.mimeType,
          },
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        return { objectKey };
      } catch (err) {
        console.error("Media upload failed:", err);
        setError("ไม่สามารถอัปโหลดไฟล์ได้");
        throw err;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return {
    upload,
    uploading,
    error,
  };
}
