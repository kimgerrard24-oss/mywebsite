// frontend/src/components/media/MediaUploadFlow.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { getMediaById } from "@/lib/api/media";
import type { MediaMetadata } from "@/types/index";

type Props = {
  /**
   * ประเภท media ที่อนุญาต
   * backend เป็น authority
   */
 mediaType: "image" | "audio" | "video";

  /**
   * callback เมื่อ backend complete แล้ว
   * (ส่ง mediaId กลับให้ parent)
   */
  onCompleted: (mediaId: string) => void;

  /**
   * optional: preview media จาก backend
   */
  previewMediaId?: string;
};

export default function MediaUploadFlow({
  mediaType,
  onCompleted,
  previewMediaId,
}: Props) {
  const { upload, uploading, error: uploadError } =
    useMediaUpload();

  const {
    complete,
    loading: completing,
    error: completeError,
  } = useMediaComplete();

  const [metadata, setMetadata] =
    useState<MediaMetadata | null>(null);

  /**
   * =====================================
   * Load media metadata (fail-soft)
   * backend = source of truth
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
        // ❗ fail-soft
        setMetadata(null);
      });
  }, [previewMediaId]);

  /**
   * =====================================
   * Upload + Complete
   * =====================================
   */
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (
  mediaType === "video" &&
  file.size > 50 * 1024 * 1024
) {
  e.target.value = "";
  return;
}

      /**
       * fail-fast (client side only)
       * backend จะ validate ซ้ำอีกครั้ง
       */
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

if (
  mediaType === "audio" &&
  !file.type.startsWith("audio/")
) {
  e.target.value = "";
  return;
}

      try {
        // 1️⃣ upload raw file → storage (R2)
        const { objectKey } = await upload(file);

        // 2️⃣ notify backend → create Media record
        const mediaId = await complete({
          objectKey,
          mediaType,
          mimeType: file.type,
        });

        onCompleted(mediaId);
      } catch {
        // error handled inside hooks (fail-soft)
      } finally {
        // allow re-select same file
        e.target.value = "";
      }
    },
    [upload, complete, mediaType, onCompleted],
  );

  const isLoading = uploading || completing;
  const error = uploadError || completeError;

  return (
    <section
      aria-label="Media upload"
      className="space-y-2"
    >
      {/* =========================
          File input
         ========================= */}
      <input
        type="file"
        accept={
  mediaType === "image"
    ? "image/*"
    : mediaType === "video"
    ? "video/*"
    : "audio/*"
}

        onChange={handleChange}
        disabled={isLoading}
        className="
          block
          w-full
          text-sm
          text-gray-700
          file:mr-3
          file:rounded-md
          file:border
          file:border-gray-300
          file:bg-white
          file:px-3
          file:py-1.5
          file:text-sm
          file:font-medium
          hover:file:bg-gray-50
          disabled:opacity-60
        "
      />

      {isLoading && (
        <p
          className="text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          กำลังอัปโหลดไฟล์…
        </p>
      )}

      {error && (
        <p
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* =========================
          Media preview (backend authority)
         ========================= */}
      {metadata && (
        <section
          aria-label="Uploaded media preview"
          className="
            rounded-lg
            border
            border-gray-200
            p-2
            bg-white
          "
        >
          {metadata.type === "image" && (
            <img
              src={metadata.url}
              alt=""
              loading="lazy"
              className="
                w-full
                max-h-[60vh]
                object-contain
                rounded-md
                bg-black/5
              "
            />
          )}

          {metadata.type === "audio" && (
            <audio
              src={metadata.url}
              controls
              preload="metadata"
              className="w-full"
            />
          )}

          {metadata.type === "video" && (
  <>
    <video
      src={metadata.url}
      poster={metadata.thumbnailUrl ?? undefined}
      controls
      preload="metadata"
      playsInline
      className="
        w-full
        max-h-[60vh]
        rounded-md
        bg-black
        object-contain
      "
    />

    {/* 🔹 Thumbnail generating state */}
    {!metadata.thumbnailUrl && (
      <p className="mt-1 text-sm text-gray-400">
        กำลังเตรียมภาพตัวอย่าง…
      </p>
    )}
  </>
)}


        </section>
      )}
    </section>
  );
}

