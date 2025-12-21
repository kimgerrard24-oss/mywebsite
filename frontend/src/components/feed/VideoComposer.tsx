// frontend/src/conponents/feed/VideoComposer.tsx
"use client";

import { useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { useCreatePost } from "@/hooks/useCreatePost";

export default function VideoComposer() {
  const [file, setFile] = useState<File | null>(null);

  const { upload } = useMediaUpload();
  const { complete } = useMediaComplete();
  const { submit, loading } = useCreatePost();

  async function handlePost() {
    if (!file) return;

    const { objectKey } = await upload(file);

    const mediaId = await complete({
      objectKey,
      mimeType: file.type,
      mediaType: "video",
    });

    await submit({
      content: "",
      mediaIds: [mediaId],
    });

    setFile(null);
  }

  return (
    <div className="p-3 border-b border-white/10 bg-black">
      <input
        type="file"
        accept="video/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
        className="text-sm text-white"
      />

      <button
        onClick={handlePost}
        disabled={!file || loading}
        className="mt-2 w-full rounded bg-blue-600 py-2 text-sm text-white"
      >
        โพสต์คลิป
      </button>
    </div>
  );
}
