// frontend/src/components/posts/EditPostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUpdatePost } from '@/hooks/useUpdatePost';
import { api } from '@/lib/api/api';

type Props = {
  postId: string;
  initialContent: string;
};

type PresignItem = {
  uploadUrl: string;
  mediaId: string;
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

  // =========================
  // File selection (NEW)
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
  // Upload media flow (NEW)
  // =========================
  async function uploadMedia(): Promise<string[]> {
    if (files.length === 0) return [];

    const presignRes = await api.post<{
      items: PresignItem[];
    }>('/media/presign/validate', {
      files: files.map((f) => ({
        filename: f.name,
        contentType: f.type,
        size: f.size,
      })),
    });

    const items = presignRes.data.items;

    if (!Array.isArray(items) || items.length !== files.length) {
      throw new Error('Invalid presign response');
    }

    await Promise.all(
      items.map((item, idx) =>
        fetch(item.uploadUrl, {
          method: 'PUT',
          body: files[idx],
          headers: {
            'Content-Type': files[idx].type,
          },
        }),
      ),
    );

    const completeRes = await api.post<{
      mediaIds: string[];
    }>('/media/complete', {
      mediaIds: items.map((i) => i.mediaId),
    });

    return completeRes.data.mediaIds;
  }

  // =========================
  // Submit edit
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLocalError(null);

      // ✅ optional media upload
      const mediaIds = await uploadMedia();

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
        disabled={loading}
      />

      {/* ===== Media picker (NEW, optional) ===== */}
      <div className="flex items-center justify-between text-sm">
        <label className="cursor-pointer text-gray-600">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={loading}
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
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
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
