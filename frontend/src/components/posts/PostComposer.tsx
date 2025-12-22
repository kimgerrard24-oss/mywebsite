"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { useCreatePost } from "@/hooks/useCreatePost";

type Props = {
  onPostCreated?: () => void;
  onPosted?: () => void; // legacy compatibility
};

const MAX_LENGTH = 2000;
const MAX_FILES = 5;

export default function PostComposer({
  onPostCreated,
  onPosted,
}: Props) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading } = useMediaUpload();
  const { complete, loading: completing } = useMediaComplete();
  const { submit, loading: creating } = useCreatePost();

  const submitting = uploading || completing || creating;
  const remaining = MAX_LENGTH - content.length;


  // =========================
  // File selection (safe)
  // =========================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files).slice(
      0,
      MAX_FILES,
    );

    setFiles(selected);
    e.target.value = "";
  };

  // =========================
  // Submit post (text + media)
  // =========================
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!content.trim() && files.length === 0) {
      setError("กรุณาเขียนข้อความหรือเลือกไฟล์ก่อนโพสต์");
      return;
    }

    if (content.length > MAX_LENGTH) {
      setError("ข้อความยาวเกินกำหนด");
      return;
    }

    try {
      setError(null);

      // 1️⃣ upload + complete media
      const mediaIds: string[] = [];

      for (const file of files) {
        const { objectKey } = await upload(file);

        const mediaId = await complete({
          objectKey,
          mimeType: file.type,
          mediaType: file.type.startsWith("video/")
            ? "video"
            : "image",
        });

        mediaIds.push(mediaId);
      }

      // 2️⃣ create post
      await submit({
        content,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
      });

      // reset state
      setContent("");
      setFiles([]);

      // callbacks (UNCHANGED)
      onPostCreated?.();
      onPosted?.();

      // ✅ FIX: fallback refresh feed
      if (!onPostCreated && !onPosted) {
        router.replace(router.asPath);
      }
    } catch (err) {
      console.error("Create post failed:", err);
      setError("ไม่สามารถโพสต์ได้ กรุณาลองใหม่");
    }
  }, [
    content,
    files,
    submitting,
    upload,
    complete,
    submit,
    onPostCreated,
    onPosted,
    router,
  ]);

return (
  <section
    aria-label="Create post"
    className="
      w-full
      bg-white
      border
      rounded-md
      sm:rounded-lg
      px-1.5
      sm:px-2
      md:px-3
      py-1
      sm:py-1.5
      shadow-sm
      space-y-1
      sm:space-y-1.5
    "
  >
    {/* ===== Textarea ===== */}
    <label htmlFor="composer-content" className="sr-only">
      Create post content
    </label>
    <textarea
      id="composer-content"
      className="
        w-full
        resize-none
        border
        rounded-md
        sm:rounded-lg
        px-1.5
        sm:px-2
        py-1
        sm:py-1.5
        text-[11px]
        sm:text-xs
        leading-snug
        placeholder-gray-400
        focus:outline-none
        focus:ring-1
        focus:ring-blue-500
        focus:border-blue-500
        disabled:opacity-60
        transition
      "
      rows={1}
      placeholder="คุณกำลังคิดอะไรอยู่?"
      value={content}
      maxLength={MAX_LENGTH}
      disabled={submitting}
      onChange={(e) => {
        const value = e.target.value;

        if (value.length >= MAX_LENGTH) {
          setError("ข้อความยาวถึงขีดจำกัดแล้ว");
        } else {
          setError(null);
        }

        setContent(value);
      }}
    />

    {/* ===== Media ===== */}
    <div className="flex items-center justify-between">
      <label
        className="
          inline-flex
          items-center
          cursor-pointer
          text-[10px]
          sm:text-[11px]
          text-gray-600
          hover:text-gray-800
          transition
        "
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={submitting}
          className="hidden"
        />
        เพิ่มรูป / วิดีโอ
      </label>
    </div>

    {files.length > 0 && (
      <p
        className="
          text-[10px]
          sm:text-[11px]
          text-gray-500
        "
        role="status"
        aria-live="polite"
      >
        เลือกไฟล์แล้ว {files.length} ไฟล์
      </p>
    )}

    {/* ===== Action ===== */}
    <div className="flex justify-end pt-0.5">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="
          px-2
          sm:px-2.5
          py-0.5
          sm:py-1
          rounded-md
          bg-blue-600
          text-[10px]
          sm:text-[11px]
          font-medium
          text-white
          hover:bg-blue-700
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition
        "
      >
        {submitting ? "กำลังโพสต์..." : "โพสต์"}
      </button>
    </div>

    {error && (
      <p
        className="
          text-[10px]
          sm:text-[11px]
          text-red-600
        "
        role="alert"
      >
        {error}
      </p>
    )}
  </section>
 );

}
