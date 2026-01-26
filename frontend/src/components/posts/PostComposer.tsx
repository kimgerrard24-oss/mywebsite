"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/router";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useMediaComplete } from "@/hooks/useMediaComplete";
import { useCreatePost } from "@/hooks/useCreatePost";
import PostVisibilitySelector from "@/components/posts/PostVisibilitySelector";
import type { PostVisibilityValue } from "@/components/posts/PostVisibilitySelector";
import { Settings } from "lucide-react";
import UserPickerModal from "@/components/users/UserPickerModal";

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
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { upload, uploading } = useMediaUpload();
  const { complete, loading: completing } = useMediaComplete();
  const { submit, loading: creating } = useCreatePost();

  const submitting = uploading || completing || creating;
  const remaining = MAX_LENGTH - content.length;
  const [visibility, setVisibility] =
  useState<PostVisibilityValue>({
    visibility: "PUBLIC",
  });
  // =========================
  // Auto-resize textarea
  // =========================
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [showVisibility, setShowVisibility] = useState(false);
  const [showIncludePicker, setShowIncludePicker] = useState(false);
  const [showExcludePicker, setShowExcludePicker] = useState(false);
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

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

    // 🔍 preview (frontend only)
    const urls = selected.map((file) =>
      URL.createObjectURL(file),
    );
    setPreviews(urls);

    e.target.value = "";
  };

  // cleanup preview URLs (memory-safe)
  useEffect(() => {
    return () => {
      previews.forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, [previews]);

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

    if (
    visibility.visibility === "CUSTOM" &&
    (visibility.includeUserIds?.length ?? 0) === 0 &&
    (visibility.excludeUserIds?.length ?? 0) === 0
  ) {
    setError("Custom visibility ต้องเลือกอย่างน้อย 1 คน");
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
        visibility: visibility.visibility,
        includeUserIds: visibility.includeUserIds,
        excludeUserIds: visibility.excludeUserIds,
        taggedUserIds,
      });
       
      // reset state
      setContent("");
      setFiles([]);
      setPreviews([]);
      setTaggedUserIds([]);
      setShowTagPicker(false);

      onPostCreated?.();
      onPosted?.();

     
      if (!onPostCreated && !onPosted) {
        router.replace(router.asPath);
      }
    setShowVisibility(false);
setShowIncludePicker(false);
setShowExcludePicker(false);

    } catch (err) {
      console.error("Create post failed:", err);
      setError("ไม่สามารถโพสต์ได้ กรุณาลองใหม่");
    }
  }, [
    content,
    files,
    visibility,
    visibility.includeUserIds,
    visibility.excludeUserIds,
    taggedUserIds,
    submitting,
    upload,
    complete,
    submit,
    onPostCreated,
    onPosted,
    router,
  ]);

  return (
    <article
      aria-label="Create post"
      className="
        w-full
        rounded-lg
        sm:rounded-xl
        border
        border-gray-200
        bg-white
        p-3
        sm:p-4
        md:p-5
        mb-3
        space-y-2
      "
    >
      {/* ===== Textarea ===== */}
      <label htmlFor="composer-content" className="sr-only">
        Create post content
      </label>

      <textarea
        ref={textareaRef}
        id="composer-content"
        className="
          w-full
          resize-none
          overflow-hidden
          border
          rounded-md
          sm:rounded-lg
          px-1
          sm:px-1.5
          py-0.5
          sm:py-0.75
          text-[10px]
          sm:text-[11px]
          leading-tight
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
          resizeTextarea();
        }}
      />

      {/* ===== Media preview ===== */}
      {previews.length > 0 && (
        <section
          className="grid grid-cols-2 gap-2 pt-1"
          aria-label="Media preview"
        >
          {files.map((file, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-black/5"
            >
              {file.type.startsWith("image") ? (
                <img
                  src={previews[i]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={previews[i]}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </section>
      )}

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
       
       {showVisibility && (
  <PostVisibilitySelector
  value={visibility}
  compact
  disabled={submitting}
  onChange={(v) => {
    setVisibility(v);

    if (v.visibility !== "CUSTOM") {
      setShowVisibility(false);
    }
  }}
  onPickInclude={() => {
    setShowVisibility(false);      // ✅ ปิด visibility panel
    setShowIncludePicker(true);    // ✅ เปิด modal เลือกคน
  }}
  onPickExclude={() => {
    setShowVisibility(false);      // ✅ ปิด visibility panel
    setShowExcludePicker(true);    // ✅ เปิด modal เลือกคน
  }}
/>


)}

{showIncludePicker && (
  <UserPickerModal
    title="Select people who can see this post"
    onClose={() => setShowIncludePicker(false)}
    onConfirm={(userIds: string[]) => {
      setVisibility(v => ({
        ...v,
        visibility: "CUSTOM",
        includeUserIds: userIds,
        excludeUserIds: v.excludeUserIds,
      }));
      setShowIncludePicker(false);
    }}
  />
)}

{showExcludePicker && (
  <UserPickerModal
    title="Exclude people from this post"
    onClose={() => setShowExcludePicker(false)}
    onConfirm={(userIds: string[]) => {
      setVisibility(v => ({
        ...v,
        visibility: "CUSTOM",
        excludeUserIds: userIds,
        includeUserIds: v.includeUserIds,
      }));
      setShowExcludePicker(false);
    }}
  />
)}


<div className="flex justify-between items-center pt-1">
  <button
  type="button"
  disabled={submitting}
  onClick={() => setShowVisibility(v => !v)}
  className="
    inline-flex items-center gap-1
    text-[10px] sm:text-[11px]
    text-gray-600 hover:text-gray-900
  "
  aria-label="Post settings"
>
 <Settings className="w-4 h-4" />
<span>Post settings</span>
</button>

</div>

<button
  type="button"
  disabled={submitting}
  onClick={() => setShowTagPicker(true)}
  className="text-sm text-gray-600 hover:text-gray-900"
>
  Tag people
</button>

{showTagPicker && (
  <UserPickerModal
    title="Tag people in this post"
    onClose={() => setShowTagPicker(false)}
    onConfirm={(userIds) => {
      setTaggedUserIds(userIds);
      setShowTagPicker(false);
    }}
  />
)}

{taggedUserIds.length > 0 && (
  <p className="text-xs text-gray-500">
    Tagged {taggedUserIds.length} people
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
    </article>
  );
}
