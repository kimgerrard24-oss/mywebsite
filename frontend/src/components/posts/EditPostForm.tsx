// frontend/src/components/posts/EditPostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUpdatePost } from '@/hooks/useUpdatePost';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useMediaComplete } from '@/hooks/useMediaComplete';

type Props = {
  postId: string;
  initialContent: string;
};

const MAX_FILES = 5;

export default function EditPostForm({
  postId,
  initialContent,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [files, setFiles] = useState<File[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const { submit, loading, error } = useUpdatePost();
  const { upload, uploading } = useMediaUpload();
  const { complete, loading: completing } = useMediaComplete();

  const submitting = loading || uploading || completing;

  // =========================
  // File selection (UNCHANGED)
  // =========================
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!e.target.files) return;

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

    try {
      setLocalError(null);

      // ✅ upload + complete media (FIXED FLOW)
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
