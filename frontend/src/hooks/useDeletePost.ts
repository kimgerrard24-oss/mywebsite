// frontend/src/hooks/useDeletePost.ts
import { useState, useCallback } from 'react';
import { deletePost } from '@/lib/api/api';


export function useDeletePost() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const remove = useCallback(async (postId: string) => {
      setLoading(true);
      setError(null);

    try {
   await deletePost(postId);
   return true;
  } catch (err: any) {
      setError('Unable to delete post');
   return false;
  } finally {
      setLoading(false);
  }
  }, []);

   return { remove, loading, error };
}