// frontend/src/hooks/useAdminDeleteComment.ts

import { useState, useCallback } from 'react';
import { adminDeleteComment } from '@/lib/api/admin-comments';

export function useAdminDeleteComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteComment = useCallback(
    async (params: {
      commentId: string;
      reason?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        await adminDeleteComment(params);
        return true;
      } catch (err: any) {
        setError(
          err?.body?.message ??
            'Failed to delete comment',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    deleteComment,
    loading,
    error,
  };
}
