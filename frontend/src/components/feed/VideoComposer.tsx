// frontend/src/components/feed/VideoComposer.tsx
"use client";

import { useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { useCreatePost } from "@/hooks/useCreatePost";

type Props = {
  onPosted?: () => void; // 🔔 แจ้ง VideoFeed เมื่อโพสต์สำเร็จ
};

const MAX_CAPTION_LENGTH = 150;

export default function VideoComposer({ onPosted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const { upload } = useMediaUpload();
  const { complete } = useMediaComplete();
  const { submit } = useCreatePost();

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selected = e.target.files?.[0] ?? null;

    if (!selected) {
      setFile(null);
      return;
    }

    // ❌ ป้องกันไฟล์ที่ไม่ใช่วิดีโอ
    if (!selected.type.startsWith("video/")) {
      setError("ไฟล์ที่เลือกไม่ใช่วิดีโอ");
      setFile(null);
      e.target.value = "";
      return;
    }

    setError(null);
    setFile(selected);
  }

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

      // 3️⃣ create post (video + caption)
      await submit({
        content: caption.trim(),
        mediaIds: [mediaId],
      });

      // reset
      setFile(null);
      setCaption("");

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
      {/* ===== Caption ===== */}
      <textarea
        rows={2}
        maxLength={MAX_CAPTION_LENGTH}
        placeholder="เขียนคำบรรยายวิดีโอ..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={posting}
        className="
          w-full
          resize-none
          rounded-md
          bg-black/40
          border
          border-white/10
          px-3
          py-2
          text-sm
          text-white
          placeholder-white/50
          focus:outline-none
          focus:ring-1
          focus:ring-blue-500
        "
      />

      {/* ===== File Picker ===== */}
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={posting}
        className="text-sm text-white"
      />

      {/* ===== Submit ===== */}
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
          disabled:cursor-not-allowed
        "
      >
        {posting ? "กำลังอัปโหลด…" : "โพสต์คลิป"}
      </button>

      {/* ===== Error ===== */}
      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
