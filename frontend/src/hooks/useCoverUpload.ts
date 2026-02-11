// frontend/src/hooks/useCoverUpload.ts

import { useState } from "react";
import { api } from "@/lib/api/api";
import { setCover } from "@/lib/api/profile-media";
import { useUserStore } from "@/stores/user.store";

type PresignResponse = {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
};

type CompleteResponse = {
  mediaId: string;
};

const MAX_COVER_SIZE = 8 * 1024 * 1024; // 8MB

export function useCoverUpload() {
  const { user, updateCover } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (!user) {
      throw new Error("Not authenticated");
    }

    if (loading) return;

    // ===============================
    // 1️⃣ Client validation
    // ===============================
    if (!file.type.startsWith("image/")) {
      const msg = "ไฟล์ต้องเป็นรูปภาพเท่านั้น";
      setError(msg);
      throw new Error(msg);
    }

    if (file.size > MAX_COVER_SIZE) {
      const msg = "ขนาดไฟล์ต้องไม่เกิน 8MB";
      setError(msg);
      throw new Error(msg);
    }

    setLoading(true);
    setError(null);

    try {
      // 2️⃣ Presign
      const presignRes = await api.post<PresignResponse>(
        "/media/presign",
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          mediaType: "image",
        },
        { withCredentials: true },
      );

      const { uploadUrl, objectKey } = presignRes.data;

      // 3️⃣ Upload to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      // 4️⃣ Complete upload
      const completeRes = await api.post<CompleteResponse>(
        "/media/complete",
        {
          objectKey,
          mediaType: "image",
          mimeType: file.type,
        },
        { withCredentials: true },
      );

      const { mediaId } = completeRes.data;

      // 5️⃣ Set cover
      const result = await setCover(mediaId);

      // 6️⃣ Sync store
      if (result?.coverUrl) {
        updateCover(result.coverUrl);
      }

    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "เกิดข้อผิดพลาดในการอัปโหลด";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    upload,
    loading,
    error,
  };
}
