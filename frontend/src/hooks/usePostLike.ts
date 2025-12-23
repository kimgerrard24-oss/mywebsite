import { useState, useCallback } from 'react';
import { likePost } from '@/lib/api/posts';
import { unlikePost } from '@/lib/api/api';
import { getPostLikes } from '@/lib/api/api';
import type { PostLike } from '@/types/post-like';

type Params = {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
};

export function usePostLike({
  postId,
  initialLiked,
  initialLikeCount,
}: Params) {
  /**
   * ============================
   * Like / Unlike (ของเดิม)
   * ============================
   */
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    // optimistic update
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    try {
      const result = liked
        ? await unlikePost(postId)
        : await likePost(postId);

      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      // rollback
      setLiked(initialLiked);
      setLikeCount(initialLikeCount);
    } finally {
      setLoading(false);
    }
  }, [postId, liked, loading, initialLiked, initialLikeCount]);

  /**
   * ============================
   * GET /posts/:id/likes (เพิ่มใหม่)
   * ============================
   */
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [likesCursor, setLikesCursor] = useState<string | null>(null);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesError, setLikesError] = useState<string | null>(null);

  const loadLikes = useCallback(
    async (opts?: { reset?: boolean }) => {
      if (likesLoading) return;

      setLikesLoading(true);
      setLikesError(null);

      try {
        const res = await getPostLikes({
          postId,
          cursor: opts?.reset ? null : likesCursor,
        });

        setLikes((prev) =>
          opts?.reset ? res.items : [...prev, ...res.items],
        );
        setLikesCursor(res.nextCursor);
      } catch {
        setLikesError('Failed to load likes');
      } finally {
        setLikesLoading(false);
      }
    },
    [postId, likesCursor, likesLoading],
  );

  /**
   * ============================
   * Public API
   * ============================
   */
  return {
    // like / unlike
    liked,
    likeCount,
    loading,
    toggleLike,

    // likes list (GET /posts/:id/likes)
    likes,
    likesLoading,
    likesError,
    hasMoreLikes: !!likesCursor,
    loadLikes,
    reloadLikes: () => loadLikes({ reset: true }),
  };
}
