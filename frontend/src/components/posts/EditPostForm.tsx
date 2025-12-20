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
      className="space-y-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={6}
        className="w-full rounded-lg border p-3 focus:outline-none focus:ring"
        required
        disabled={submitting}
      />

      {/* ===== Media picker (UNCHANGED UI) ===== */}
      <div className="flex items-center justify-between text-sm">
        <label className="cursor-pointer text-gray-600">
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
          <span className="text-xs text-gray-500">
            {files.length} file(s) selected
          </span>
        )}
      </div>

      {(error || localError) && (
        <p className="text-sm text-red-600">
          {error ?? localError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
