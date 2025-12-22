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
  <div
    className="
      w-full
      px-2
      sm:px-3
      md:px-4
      py-2
      border-b
      border-white/10
      bg-black
      space-y-1
      sm:space-y-2
    "
    role="form"
    aria-label="Video caption composer"
  >
    {/* ===== Caption ===== */}
    <label className="sr-only" htmlFor="video-caption">
      Video caption
    </label>
    <textarea
      id="video-caption"
      rows={1}
      maxLength={MAX_CAPTION_LENGTH}
      placeholder="คำบรรยาย..."
      value={caption}
      onChange={(e) => setCaption(e.target.value)}
      disabled={posting}
      className="
        w-full
        resize-none
        rounded
        sm:rounded-md
        bg-black/40
        border
        border-white/10
        px-2
        sm:px-3
        py-1
        sm:py-1.5
        text-xs
        sm:text-sm
        text-white
        placeholder-white/50
        focus:outline-none
        focus:ring-1
        focus:ring-blue-500
        disabled:opacity-60
      "
    />

    {/* ===== Actions row ===== */}
    <div
      className="
        flex
        items-center
        justify-between
        gap-2
        sm:gap-3
      "
    >
      {/* File picker */}
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={posting}
        className="
          block
          max-w-full
          truncate
          text-[10px]
          sm:text-xs
          text-white/70
          file:mr-2
          file:rounded
          file:border-0
          file:bg-white/10
          file:px-2
          file:py-1
          file:text-white
          file:text-xs
          hover:file:bg-white/20
          disabled:opacity-60
        "
      />

      {/* Submit */}
      <button
        onClick={handlePost}
        disabled={!file || posting}
        className="
          px-3
          sm:px-4
          py-1
          sm:py-1.5
          rounded
          sm:rounded-md
          bg-blue-600
          text-xs
          sm:text-sm
          text-white
          font-medium
          disabled:opacity-50
          disabled:cursor-not-allowed
          hover:bg-blue-700
          transition
        "
      >
        {posting ? "อัปโหลด…" : "โพสต์"}
      </button>
    </div>

    {/* ===== Error ===== */}
    {error && (
      <p
        className="
          text-[10px]
          sm:text-xs
          text-red-400
        "
        role="alert"
      >
        {error}
      </p>
    )}
  </div>
);


}
