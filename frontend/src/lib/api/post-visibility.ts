// frontend/src/lib/api/post-visibility.ts

import { api } from './api';
import type { PostVisibilityDecision } from '@/types/post-visibility';

/**
 * POST /api/posts/visibility/validate
 * Backend authority
 */
export async function validatePostVisibility(
  postId: string,
): Promise<PostVisibilityDecision> {
  const res = await api.post<PostVisibilityDecision>(
    '/posts/visibility/validate',
    { postId },
    { withCredentials: true },
  );

  return res.data;
}
