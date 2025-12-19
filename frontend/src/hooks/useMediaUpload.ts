// frontend/src/hooks/useMediaUpload.ts
import { useCallback, useState } from "react";
import {
  requestPresignValidate,
  type PresignValidateRequest,
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
        const mediaType =
          file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
            ? "video"
            : null;

        if (!mediaType) {
          throw new Error("Unsupported media type");
        }

        const payload: PresignValidateRequest = {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          mediaType,
        };

        // 1️⃣ ขอ presigned URL
        const { uploadUrl, objectKey } =
          await requestPresignValidate(payload);

        // 2️⃣ upload ตรงไป R2
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
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
