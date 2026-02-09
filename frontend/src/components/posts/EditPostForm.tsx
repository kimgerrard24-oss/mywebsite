// frontend/src/components/posts/EditPostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUpdatePost } from '@/hooks/useUpdatePost';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useMediaComplete } from '@/hooks/useMediaComplete';
import PostVisibilitySelector from "@/components/posts/PostVisibilitySelector";
import { usePostVisibility } from "@/hooks/usePostVisibility";
import type {
  PostVisibilityValue,
} from "@/components/posts/PostVisibilitySelector";
import UserPickerModal from "@/components/users/UserPickerModal";

type Props = {
  postId: string;
  initialContent: string;
  initialVisibility: PostVisibilityValue;
};


const MAX_FILES = 5;

export default function EditPostForm({
  postId,
  initialContent,
  initialVisibility,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [files, setFiles] = useState<File[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showIncludePicker, setShowIncludePicker] = useState(false);
  const [showExcludePicker, setShowExcludePicker] = useState(false);

  const { submit, loading, error } = useUpdatePost();
  const { upload, uploading } = useMediaUpload();
  const { complete, loading: completing } = useMediaComplete();
  const [mediaProcessing, setMediaProcessing] = useState(false);
  const {
  value: visibility,
  loading: visibilityLoading,
  error: visibilityError,
  updateVisibility,
} = usePostVisibility({
  postId,
  initial: initialVisibility,
});

const submitting =
  loading ||
  uploading ||
  completing ||
  visibilityLoading ||
  mediaProcessing;
   
  // =========================
  // File selection (UNCHANGED)
  // =========================
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!e.target.files) return;

    if (submitting || mediaProcessing) {
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
  // Submit edit
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (
  visibility.visibility === "CUSTOM" &&
  (visibility.includeUserIds?.length ?? 0) === 0 &&
  (visibility.excludeUserIds?.length ?? 0) === 0
) {
  setLocalError("Custom visibility ต้องเลือกอย่างน้อย 1 คน");
  return;
}

    try {
      setLocalError(null);
      setMediaProcessing(true);

      const mediaIds: string[] = [];

      for (const file of files) {
        const { objectKey } = await upload(file);

        const mediaId = await complete({
          objectKey,
          mimeType: file.type,
          mediaType: file.type.startsWith('video/')
            ? 'video'
            : 'image',
        });

        mediaIds.push(mediaId);
      }

      const result = await submit({
        postId,
        content,
        ...(mediaIds.length > 0 ? { mediaIds } : {}),
      });

      if (result) {
        router.replace(`/posts/${postId}`);
      }
    } catch (err) {
  console.error(err);
  setLocalError('Failed to update post');
} finally {
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
    aria-label="Edit post"
  >
    <label htmlFor="edit-content" className="sr-only">
      Post content
    </label>

    <textarea
      id="edit-content"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      maxLength={2000}
      rows={6}
      required
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
        text-sm
      "
    >
      <label
        className="
          inline-flex
          items-center
          cursor-pointer
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

    {(error || localError) && (
      <p
        className="
          text-xs
          sm:text-sm
          text-red-600
        "
        role="alert"
      >
        {error ?? localError}
      </p>
    )}

    <PostVisibilitySelector
  value={visibility}
  disabled={submitting || visibilityLoading}
  onChange={updateVisibility}
  onPickInclude={() => setShowIncludePicker(true)}
  onPickExclude={() => setShowExcludePicker(true)}
/>

{showIncludePicker && (
  <UserPickerModal
    title="Select people who can see this post"
    onClose={() => setShowIncludePicker(false)}
    onConfirm={(userIds: string[]) => {
      updateVisibility({
        visibility: "CUSTOM",
        includeUserIds: userIds,
        excludeUserIds: visibility.excludeUserIds,
      });
      setShowIncludePicker(false);
    }}
  />
)}

{showExcludePicker && (
  <UserPickerModal
    title="Exclude people from this post"
    onClose={() => setShowExcludePicker(false)}
    onConfirm={(userIds: string[]) => {
      updateVisibility({
        visibility: "CUSTOM",
        excludeUserIds: userIds,
        includeUserIds: visibility.includeUserIds,
      });
      setShowExcludePicker(false);
    }}
  />
)}


<p className="text-xs text-gray-500">
  Visibility is saved automatically.
</p>

{visibility.visibility === 'CUSTOM' &&
  (visibility.includeUserIds?.length ?? 0) === 0 &&
  (visibility.excludeUserIds?.length ?? 0) === 0 && (
    <p className="text-xs text-yellow-600">
      Custom visibility requires selecting at least one person.
    </p>
)}


{visibilityError && (
  <p
    className="text-xs sm:text-sm text-red-600"
    role="alert"
  >
    Failed to update post visibility
  </p>
)}



    <div
      className="
        flex
        flex-col-reverse
        sm:flex-row
        gap-2
        sm:gap-3
        sm:justify-end
        pt-1
        sm:pt-2
      "
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="
          inline-flex
          items-center
          justify-center
          rounded-lg
          sm:rounded-xl
          border
          border-gray-300
          px-4
          sm:px-5
          py-2
          sm:py-2.5
          text-sm
          sm:text-base
          hover:bg-gray-50
          transition
        "
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="
          inline-flex
          items-center
          justify-center
          rounded-lg
          sm:rounded-xl
          bg-blue-600
          px-4
          sm:px-5
          py-2
          sm:py-2.5
          text-sm
          sm:text-base
          font-medium
          text-white
          hover:bg-blue-700
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition
        "
      >
        {submitting ? "Saving…" : "Save"}
      </button>
      
    </div>
  </form>
);

}
