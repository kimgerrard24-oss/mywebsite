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

const MAX_LENGTH = 500;
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
      className="bg-white border rounded-2xl p-4 shadow-sm space-y-3"
    >
      <textarea
        className="w-full resize-none border rounded-xl p-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="คุณกำลังคิดอะไรอยู่?"
        value={content}
        maxLength={MAX_LENGTH}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />

      {/* ===== Media picker ===== */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600 cursor-pointer">
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

        <span className="text-xs text-gray-500">
          เหลืออีก {remaining} ตัวอักษร
        </span>
      </div>

      {files.length > 0 && (
        <p className="text-xs text-gray-500">
          เลือกไฟล์แล้ว {files.length} ไฟล์
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white
                     text-sm font-medium disabled:opacity-50
                     disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          {submitting ? "กำลังโพสต์..." : "โพสต์"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </section>
  );
}
