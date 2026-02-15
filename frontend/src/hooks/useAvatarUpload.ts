// frontend/src/hooks/useAvatarUpload.ts

import { useState } from "react";
import {
  buildPresignValidatePayload,
  requestPresignValidate,
} from "@/lib/api/media";
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

type UploadResult = {
  mediaId: string;
  url: string | null;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export function useAvatarUpload() {
  const { user, updateAvatar } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================
   * PRODUCTION-CRITICAL:
   * upload() MUST return mediaId + url
   * so composer binds draft.mediaId to NEW uploaded avatar
   * ============================================================
   */
  async function upload(
  file: File,
  caption?: string | null
): Promise<UploadResult>
 {
    if (!user) {
      throw new Error("Not authenticated");
    }

    if (loading) {
      throw new Error("Upload already in progress");
    }

    /**
     * ===============================
     * 1️⃣ Client-side validation
     * ===============================
     */
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
       * 3️⃣ Upload to R2
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
       * 4️⃣ Complete upload
       * ===============================
       */
     const completeRes = await api.post<CompleteResponse>(
  "/media/complete",
  {
    objectKey,
    mediaType: "image",
    mimeType: file.type,
    mediaCategory: "AVATAR",
  },
  { withCredentials: true },
);

const { mediaId } = completeRes.data;

const profileRes = await api.post(
  "/users/me/profile-media",
  {
    mediaId,
    type: "AVATAR",
    caption: caption ?? null,
    setAsCurrent: true,
  },

  { withCredentials: true }
);

let avatarUrl: string | null = null;

if (profileRes.data?.url) {
  avatarUrl = `${profileRes.data.url}?t=${Date.now()}`;
  updateAvatar(avatarUrl);
}



      /**
       * ============================================================
       * CRITICAL FIX:
       * return mediaId and url so composer binds correct media
       * ============================================================
       */
      return {
        mediaId,
        url: avatarUrl,
      };

    } catch (err: any) {

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "เกิดข้อผิดพลาดในการอัปโหลด";

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
