// frontend/src/hooks/useUpdateComment.ts
import { useCallback, useState } from 'react';
import { updateComment } from '@/lib/api/comments';

export function useUpdateComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (params: {
      commentId: string;
      content: string;
    }) => {
      const { commentId, content } = params;

      if (!content.trim()) {
        setError('คอมเมนต์ต้องไม่ว่าง');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await updateComment(commentId, content);

        return res;
      } catch (err) {
        console.error('Update comment failed:', err);
        setError('ไม่สามารถแก้ไขคอมเมนต์ได้');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    submit,
    loading,
    error,
  };
}
