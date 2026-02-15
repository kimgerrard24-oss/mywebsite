// frontend/src/hooks/useCoverUpload.ts

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

const MAX_COVER_SIZE = 8 * 1024 * 1024; // 8MB

export function useCoverUpload() {

  const { user, updateCover } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================
   * PRODUCTION-CRITICAL:
   * upload() MUST return mediaId + url
   * so composer binds correct cover media
   * ============================================================
   */
  async function upload(
    file: File,
    caption?: string | null
  ): Promise<UploadResult> {

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (loading) {
      throw new Error("Upload already in progress");
    }

    /**
     * ===============================
     * 1️⃣ Client validation
     * ===============================
     */
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
       * 4️⃣ Complete upload (create media row)
       * ===============================
       */
      const completeRes = await api.post<CompleteResponse>(
        "/media/complete",
        {
          objectKey,
          mediaType: "image",
          mimeType: file.type,
          mediaCategory: "COVER",
        },
        { withCredentials: true }
      );

      const { mediaId } = completeRes.data;

      /**
       * ===============================
       * 5️⃣ Attach to profile media + caption
       * ===============================
       */
      const profileRes = await api.post(
        "/users/me/profile-media",
        {
          mediaId,
          type: "COVER",
          caption: caption ?? null,
          setAsCurrent: true,
        },
        { withCredentials: true }
      );

      /**
       * ===============================
       * 6️⃣ Build URL + update store
       * ===============================
       */
      let coverUrl: string | null = null;

      if (profileRes.data?.url) {

        coverUrl = `${profileRes.data.url}?t=${Date.now()}`;

        /**
         * Sync cover in global store
         */
        updateCover(coverUrl);

      }

      /**
       * ============================================================
       * CRITICAL:
       * return mediaId and url so UI stays authoritative
       * ============================================================
       */
      return {
        mediaId,
        url: coverUrl,
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
