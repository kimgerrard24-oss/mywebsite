// frontend/src/components/feed/VideoComposer.tsx
"use client";

import { useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { useCreatePost } from "@/hooks/useCreatePost";

type Props = {
  onPosted?: () => void; // 🔑 แจ้ง VideoFeed เมื่อโพสต์สำเร็จ
};

export default function VideoComposer({ onPosted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const { upload } = useMediaUpload();
  const { complete } = useMediaComplete();
  const { submit } = useCreatePost();

  async function handlePost() {
    if (!file || posting) return;

    try {
      setPosting(true);
      setError(null);

      // 1️⃣ upload
      const { objectKey } = await upload(file);

      // 2️⃣ complete
      const mediaId = await complete({
        objectKey,
        mimeType: file.type,
        mediaType: "video",
      });

      // 3️⃣ create post
      await submit({
        content: "",
        mediaIds: [mediaId],
      });

      // reset
      setFile(null);

      // 🔔 notify parent
      onPosted?.();
    } catch (err) {
      console.error("Video post failed:", err);
      setError("ไม่สามารถโพสต์วิดีโอได้ กรุณาลองใหม่");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="p-3 border-b border-white/10 bg-black space-y-2">
      <input
        type="file"
        accept="video/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
        disabled={posting}
        className="text-sm text-white"
      />

      <button
        onClick={handlePost}
        disabled={!file || posting}
        className="
          w-full
          rounded
          bg-blue-600
          py-2
          text-sm
          text-white
          disabled:opacity-50
        "
      >
        {posting ? "กำลังอัปโหลด…" : "โพสต์คลิป"}
      </button>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
