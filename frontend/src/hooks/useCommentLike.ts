// frontend/src/hooks/useCommentLike.ts

import { useState } from 'react';
import { toggleCommentLike } from '@/lib/api/comments';

type UseCommentLikeParams = {
  commentId: string;
  initialLiked: boolean;
  initialLikeCount: number;
};

export function useCommentLike({
  commentId,
  initialLiked,
  initialLikeCount,
}: UseCommentLikeParams) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] =
    useState(initialLikeCount);
  const [loading, setLoading] =
    useState(false);

  async function toggleLike() {
    if (loading) return;

    // optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount(
      prevLiked ? prevCount - 1 : prevCount + 1,
    );
    setLoading(true);

    try {
      const result = await toggleCommentLike(
        commentId,
      );

      // sync with backend authority
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      // rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return {
    liked,
    likeCount,
    loading,
    toggleLike,
  };
}
