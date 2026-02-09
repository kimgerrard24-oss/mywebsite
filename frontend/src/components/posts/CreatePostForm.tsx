// frontend/src/components/posts/CreatePostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useMediaComplete } from '@/hooks/useMediaComplete';
import { createPost } from '@/lib/api/posts';
import PostVisibilitySelector from "@/components/posts/PostVisibilitySelector";
import { Settings } from "lucide-react";
import UserPickerModal from "@/components/users/UserPickerModal";

const MAX_FILES = 5;

export default function CreatePostForm() {
  const router = useRouter();

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading } = useMediaUpload();
  const { complete, loading: completing } = useMediaComplete();
  const [mediaProcessing, setMediaProcessing] = useState(false);
  
  const submitting =
  loading ||
  uploading ||
  completing ||
  mediaProcessing;

  const [visibility, setVisibility] = useState<{
    visibility: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM";
    includeUserIds?: string[];
    excludeUserIds?: string[];
      }>({ visibility: "PUBLIC" });

  const [showVisibility, setShowVisibility] = useState(false);
  const [showIncludePicker, setShowIncludePicker] = useState(false);
  const [showExcludePicker, setShowExcludePicker] = useState(false);
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // =========================
  // File selection (UNCHANGED)
  // =========================
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!e.target.files) return;

    if (uploading || completing || submitting || mediaProcessing) {

  e.target.value = "";
  return;
}

    const selected = Array.from(e.target.files).slice(
      0,
      MAX_FILES,
    );

    setFiles(selected);
  }

  // =========================
  // Submit post
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim() && files.length === 0) {
      setError('Post must have text or media');
      return;
    }

    if (submitting || mediaProcessing) return;

    if (
  visibility.visibility === "CUSTOM" &&
  (visibility.includeUserIds?.length ?? 0) === 0 &&
  (visibility.excludeUserIds?.length ?? 0) === 0
) {
  setError("Custom visibility requires selecting at least one person");
  return;
}


    try {
      setLoading(true);
      setMediaProcessing(true);
      setError(null);

     // ===== 1️⃣ upload ทุกไฟล์ =====
const uploaded = await Promise.all(
  files.map(async (file) => {
    const { objectKey } = await upload(file);
    return { file, objectKey };
  })
);

// ===== 2️⃣ complete ทุกไฟล์ =====
const mediaIds = await Promise.all(
  uploaded.map(({ file, objectKey }) =>
    complete({
      objectKey,
      mimeType: file.type,
      mediaType: file.type.startsWith("video/")
        ? "video"
        : "image",
    })
  )
);

// ===== 3️⃣ guard =====
if (files.length > 0 && mediaIds.length !== files.length) {
  setError("อัปโหลดรูป/วิดีโอไม่สำเร็จ กรุณาลองใหม่");
  return;
}


      // create post (UNCHANGED)
      const res = await createPost({
  content,
  mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
  visibility: visibility.visibility,
  includeUserIds: visibility.includeUserIds,
  excludeUserIds: visibility.excludeUserIds,
  taggedUserIds,
});

if (res.failedTags && res.failedTags.length > 0) {
  const r = res.failedTags[0].reason;

  let msg = "Some people cannot be tagged";

  switch (r) {
    case "FOLLOWERS_ONLY":
      msg = "User allows tagging from followers only";
      break;
    case "FOLLOWING_ONLY":
      msg = "User allows tagging only from people they follow";
      break;
    case "TAG_DISABLED":
      msg = "User has disabled tagging";
      break;
    case "BLOCKED":
      msg = "You cannot tag this user";
      break;
  }

  setError(msg);
}


      setTaggedUserIds([]);
      setContent('');
      setFiles([]);
      setShowTagPicker(false);

      router.replace(router.asPath);
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
      setMediaProcessing(false);
    }
  }

  return (
  <form
    onSubmit={handleSubmit}
    className="
      w-full
      flex
      flex-col
      gap-3
      sm:gap-4
    "
    aria-label="Create post"
  >
    <label htmlFor="content" className="sr-only">
      Post content
    </label>

    <textarea
      id="content"
      name="content"
      rows={4}
      maxLength={2000}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="What’s on your mind?"
      disabled={submitting}
      className="
        w-full
        rounded-lg
        sm:rounded-xl
        border
        border-gray-300
        p-3
        sm:p-4
        text-sm
        sm:text-base
        leading-relaxed
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        disabled:opacity-60
        resize-y
      "
    />

    {/* ===== Media picker (UNCHANGED UI / responsive only) ===== */}
    <div
      className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-2
        sm:gap-3
      "
    >
      <label
        className="
          inline-flex
          items-center
          cursor-pointer
          text-sm
          sm:text-base
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
        Add photo / video
      </label>

      {files.length > 0 && (
        <span
          className="
            text-xs
            sm:text-sm
            text-gray-500
          "
        >
          {files.length} file(s) selected
        </span>
      )}
    </div>

    {error && (
      <p
        className="
          text-xs
          sm:text-sm
          text-red-600
        "
        role="alert"
      >
        {error}
      </p>
    )}
    
     <div className="relative">
  <button
  type="button"
  disabled={submitting}
  onClick={() => {
  setShowVisibility(v => {
    const next = !v;
    if (!next) {
      setShowIncludePicker(false);
      setShowExcludePicker(false);
    }
    return next;
  });
}}

  className="
    inline-flex items-center gap-1
    text-sm text-gray-600 hover:text-gray-900
  "
  aria-label="Post settings"
>
  <Settings className="w-4 h-4" />
<span>Post settings</span>
</button>

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


  {showVisibility && (
    <div className="mt-2">
      <PostVisibilitySelector
  value={visibility}
  disabled={submitting}
  onChange={(v) => {
  setVisibility(v);

  if (v.visibility !== "CUSTOM") {
    setShowVisibility(false);
  }
}}

  onPickInclude={() => !submitting && setShowIncludePicker(true)}
  onPickExclude={() => !submitting && setShowExcludePicker(true)}

/>

{showIncludePicker && (
  <UserPickerModal
    title="Select people who can see this post"
    max={10}
    onClose={() => setShowIncludePicker(false)}
    onConfirm={(userIds) => {
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
    max={10}
    onClose={() => setShowExcludePicker(false)}
    onConfirm={(userIds) => {
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


    </div>
  )}
</div>


    <div className="flex justify-end pt-1 sm:pt-2">
      <button
        type="submit"
        disabled={submitting}
        className="
          inline-flex
          items-center
          justify-center
          rounded-lg
          sm:rounded-xl
          bg-black
          px-4
          sm:px-5
          py-2
          sm:py-2.5
          text-sm
          sm:text-base
          font-medium
          text-white
          hover:bg-gray-900
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition
        "
      >
        {submitting ? "Posting..." : "Post"}
      </button>
    </div>
  </form>
);

}
