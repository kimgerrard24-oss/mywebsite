// frontend/src/components/posts/CreatePostForm.tsx
import { useState } from 'react';
import { createPost } from '@/lib/api/posts';
import { api } from '@/lib/api/api';

const MAX_FILES = 5;

type PresignItem = {
  uploadUrl: string;
  mediaId: string;
};

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // 1) request presigned URLs
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

    // 2) upload to R2
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

    // 3) notify backend upload complete
    const completeRes = await api.post<{
      mediaIds: string[];
    }>('/media/complete', {
      mediaIds: items.map((i) => i.mediaId),
    });

    return completeRes.data.mediaIds;
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

    try {
      setLoading(true);
      setError(null);

      // ✅ NEW: upload media (optional)
      const mediaIds = await uploadMedia();

      // ✅ BACKWARD SAFE: text-only ยังทำงานเหมือนเดิม
      await createPost({
        content,
        mediaIds,
      });

      setContent('');
      setFiles([]);
      alert('Post created successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
        className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring"
        placeholder="What’s on your mind?"
        disabled={loading}
      />

      {/* ===== Media picker (NEW, optional) ===== */}
      <div className="mt-2 flex items-center justify-between">
        <label className="cursor-pointer text-sm text-gray-600">
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

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
