// frontend/src/components/posts/CreatePostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useMediaComplete } from '@/hooks/useMediaComplete';
import { createPost } from '@/lib/api/posts';

const MAX_FILES = 5;

export default function CreatePostForm() {
  const router = useRouter();

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // upload + complete media (UNCHANGED)
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

      // create post (UNCHANGED)
      await createPost({
        content,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
      });

      setContent('');
      setFiles([]);

      // ✅ FIX: refresh feed หลังโพสต์สำเร็จ
      router.replace(router.asPath);
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
        disabled={submitting}
      />

      {/* ===== Media picker (UNCHANGED UI) ===== */}
      <div className="mt-2 flex items-center justify-between">
        <label className="cursor-pointer text-sm text-gray-600">
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

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
