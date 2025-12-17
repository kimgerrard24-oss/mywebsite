// frontend/src/components/posts/CreatePostForm.tsx
import { useState } from 'react';
import { createPost } from '@/lib/api/posts';

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createPost({ content });

      setContent('');
      alert('Post created successfully');
    } catch (err) {
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
      />

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
