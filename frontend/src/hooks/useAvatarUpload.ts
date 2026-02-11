// frontend/src/hooks/useAvatarUpload.ts

import { useState } from "react";
import {
  buildPresignValidatePayload,
  requestPresignValidate,
} from "@/lib/api/media";
import { setAvatar } from "@/lib/api/profile-media";
import { useUserStore } from "@/stores/user.store";
import { api } from "@/lib/api/api";

type PresignResponse = {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
};

type CompleteResponse = {
  mediaId: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export function useAvatarUpload() {
  const { user, updateAvatar } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (!user) {
      throw new Error("Not authenticated");
    }

    if (loading) return;

    // ===============================
    // 1️⃣ Client-side validation (UX + abuse guard)
    // ===============================
    if (!file.type.startsWith("image/")) {
      const msg = "ไฟล์ต้องเป็นรูปภาพเท่านั้น";
      setError(msg);
      throw new Error(msg);
    }

    if (file.size > MAX_AVATAR_SIZE) {
      const msg = "ขนาดไฟล์ต้องไม่เกิน 5MB";
      setError(msg);
      throw new Error(msg);
    }

    setLoading(true);
    setError(null);

    try {
      /**
       * ===============================
       * 2️⃣ Request presign URL
       * ===============================
       */
      const payload = buildPresignValidatePayload(file);

      const { uploadUrl, objectKey } =
         await requestPresignValidate(payload);

      /**
       * ===============================
       * 3️⃣ Upload to R2 (direct)
       * ===============================
       */
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

      /**
       * ===============================
       * 4️⃣ Complete upload (persist media)
       * ===============================
       */
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

      /**
       * ===============================
       * 5️⃣ Set avatar (backend authority)
       * ===============================
       */
      const result = await setAvatar(mediaId);
      // result ต้อง return { avatarUrl: string }

      /**
       * ===============================
       * 6️⃣ Sync avatar in store (no reload)
       * ===============================
       */
      if (result?.avatarUrl) {
        updateAvatar(result.avatarUrl);
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
