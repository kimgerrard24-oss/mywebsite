// frontend/src/hooks/useUpdatePost.ts
import { useState } from 'react';
import { updatePost } from '@/lib/api/posts';

export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(params: {
    postId: string;
    content: string;
  }) {
    try {
      setLoading(true);
      setError(null);

      return await updatePost(params);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Failed to update post',
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
  };
}
