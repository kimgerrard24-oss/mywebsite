// frontend/src/hooks/useDeleteComment.ts
import { useCallback, useState } from 'react';
import { deleteComment } from '@/lib/api/comments';

export function useDeleteComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (commentId: string) => {
      try {
        setLoading(true);
        setError(null);

        await deleteComment(commentId);
        return true;
      } catch (err) {
        console.error('Delete comment failed:', err);
        setError('ไม่สามารถลบคอมเมนต์ได้');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading, error };
}

