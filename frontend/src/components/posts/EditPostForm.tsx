// frontend/src/components/posts/EditPostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUpdatePost } from '@/hooks/useUpdatePost';

type Props = {
  postId: string;
  initialContent: string;
};

export default function EditPostForm({
  postId,
  initialContent,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const { submit, loading, error } = useUpdatePost();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await submit({ postId, content });
    if (result) {
      router.replace(`/posts/${postId}`);
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
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
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
