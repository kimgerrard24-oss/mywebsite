// frontend/src/components/media/MediaUploadFlow.tsx
"use client";

import { useCallback } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";

type Props = {
  mediaType: "image" | "video";
  onCompleted: (mediaId: string) => void;
};

export default function MediaUploadFlow({
  mediaType,
  onCompleted,
}: Props) {
  const { upload, uploading, error: uploadError } = useMediaUpload();
  const { complete, loading, error: completeError } = useMediaComplete();

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        /**
         * STEP 1: Upload file to R2 via presigned URL
         * upload() must return: { objectKey: string }
         */
        const { objectKey } = await upload(file);

        /**
         * STEP 2: Notify backend that upload is complete
         * complete() must return: mediaId (string)
         */
        const mediaId = await complete({
          objectKey,
          mediaType,
          mimeType: file.type,
        });

        onCompleted(mediaId);
      } catch {
        // errors are handled inside hooks (fail-soft)
      } finally {
        // allow re-selecting same file
        e.target.value = "";
      }
    },
    [upload, complete, mediaType, onCompleted],
  );

  const isLoading = uploading || loading;
  const error = uploadError || completeError;

  return (
    <section aria-label="Media upload">
      <input
        type="file"
        accept={mediaType === "image" ? "image/*" : "video/*"}
        onChange={handleChange}
        disabled={isLoading}
      />

      {isLoading && (
        <p className="mt-2 text-sm text-gray-500">
          กำลังอัปโหลดไฟล์…
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
