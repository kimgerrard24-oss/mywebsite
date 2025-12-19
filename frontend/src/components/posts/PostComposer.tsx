"use client";

import { useState, useCallback } from "react";
import { createPost } from "@/lib/api/posts";
import { api } from "@/lib/api/api";

type Props = {
  onPostCreated?: () => void;
  onPosted?: () => void; // legacy compatibility
};

const MAX_LENGTH = 500;
const MAX_FILES = 5;

// ===== Presign response item (from backend) =====
type PresignItem = {
  uploadUrl: string;
  mediaId: string;
};

export default function PostComposer({
  onPostCreated,
  onPosted,
}: Props) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_LENGTH - content.length;

  // =========================
  // File selection (safe)
  // =========================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files)
      .slice(0, MAX_FILES);

    setFiles(selected);
    e.target.value = "";
  };

  // =========================
  // Upload media (presign → PUT → complete)
  // =========================
  const uploadMedia = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    // 1) ขอ presigned URLs
    const presignRes = await api.post<{
      items: PresignItem[];
    }>("/media/presign/validate", {
      files: files.map((f) => ({
        filename: f.name,
        contentType: f.type,
        size: f.size,
      })),
    });

    const items = presignRes.data.items;

    if (
      !Array.isArray(items) ||
      items.length !== files.length
    ) {
      throw new Error("Invalid presign response");
    }

    // 2) Upload ตรงไป R2
    await Promise.all(
      items.map((item, idx) =>
        fetch(item.uploadUrl, {
          method: "PUT",
          body: files[idx],
          headers: {
            "Content-Type": files[idx].type,
          },
        }),
      ),
    );

    // 3) แจ้ง backend ว่า upload เสร็จ
    const completeRes = await api.post<{
      mediaIds: string[];
    }>("/media/complete", {
      mediaIds: items.map((i) => i.mediaId),
    });

    return completeRes.data.mediaIds;
  };

  // =========================
  // Submit post (text + mediaIds)
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
      setSubmitting(true);
      setError(null);

      const mediaIds = await uploadMedia();

      await createPost({
        content,
        mediaIds,
      });

      // reset state
      setContent("");
      setFiles([]);

      // callbacks (compatibility-safe)
      onPostCreated?.();
      onPosted?.();
    } catch (err) {
      console.error("Create post failed:", err);
      setError("ไม่สามารถโพสต์ได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }, [content, files, submitting, onPostCreated, onPosted]);

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
