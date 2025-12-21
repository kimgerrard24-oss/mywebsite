// frontend/src/components/media/MediaUploadFlow.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { getMediaById } from "@/lib/api/media";
import { MediaMetadata } from "@/types/index"


type Props = {
  mediaType: "image" | "video";
  onCompleted: (mediaId: string) => void;

  /**
   * 🔹 Optional
   * ถ้ามี → แสดง media metadata จาก GET /media/:id
   * ถ้าไม่มี → ไม่กระทบ behavior เดิม
   */
  previewMediaId?: string;
};

export default function MediaUploadFlow({
  mediaType,
  onCompleted,
  previewMediaId,
}: Props) {
  const { upload, uploading, error: uploadError } = useMediaUpload();
  const {
    complete,
    loading: completing,
    error: completeError,
  } = useMediaComplete();

  const [metadata, setMetadata] =
    useState<MediaMetadata | null>(null);

  /**
   * =====================================
   * 🔹 NEW: Load media metadata (fail-soft)
   * =====================================
   */
  useEffect(() => {
    if (!previewMediaId) {
      setMetadata(null);
      return;
    }

    getMediaById(previewMediaId)
      .then(setMetadata)
      .catch(() => {
        // fail-soft: ไม่ให้กระทบ upload flow
        setMetadata(null);
      });
  }, [previewMediaId]);

  /**
   * =====================================
   * 🔹 Existing upload flow (UNCHANGED)
   * =====================================
   */
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 🔒 fail-fast: ป้องกัน mediaType mismatch
      if (
        mediaType === "image" &&
        !file.type.startsWith("image/")
      ) {
        e.target.value = "";
        return;
      }

      if (
        mediaType === "video" &&
        !file.type.startsWith("video/")
      ) {
        e.target.value = "";
        return;
      }

      try {
        const { objectKey } = await upload(file);

        const mediaId = await complete({
          objectKey,
          mediaType,
          mimeType: file.type,
        });

        onCompleted(mediaId);
      } catch {
        // errors are handled inside hooks (fail-soft)
      } finally {
        e.target.value = "";
      }
    },
    [upload, complete, mediaType, onCompleted],
  );

  const isLoading = uploading || completing;
  const error = uploadError || completeError;

  return (
    <section aria-label="Media upload" className="space-y-3">
      {/* =========================
          Existing upload UI
         ========================= */}
      <input
        type="file"
        accept={mediaType === "image" ? "image/*" : "video/*"}
        onChange={handleChange}
        disabled={isLoading}
      />

      {isLoading && (
        <p className="text-sm text-gray-500">
          กำลังอัปโหลดไฟล์…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* =========================
          🔹 NEW: Media preview
         ========================= */}
      {metadata && (
        <section
          aria-label="Uploaded media preview"
          className="rounded-lg border p-3"
        >
          {metadata.type === "image" && (
            <img
              src={metadata.url}
              alt=""
              className="w-full rounded"
            />
          )}

          {metadata.type === "video" && (
            <video
              src={metadata.url}
              controls
              preload="metadata"
              className="w-full rounded"
            />
          )}
        </section>
      )}
    </section>
  );
}
