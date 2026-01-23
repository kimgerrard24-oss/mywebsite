// frontend/src/lib/api/post-visibility.ts

import { api } from './api';
import type {
  PostVisibilityDecision,
  UpdatePostVisibilityPayload,
  PostVisibilityValue,
} from '@/types/post-visibility';
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

export async function updatePostVisibility(
  postId: string,
  payload: UpdatePostVisibilityPayload,
): Promise<{ success: true }> {
  const res = await api.patch(
    `/posts/${postId}/visibility`,
    payload,
    { withCredentials: true },
  );

  return res.data;
}

/**
 * ✅ GET /posts/:id/visibility-rules (owner only)
 */
export async function getPostVisibilityRules(
  postId: string,
): Promise<PostVisibilityValue> {
  const res = await api.get<PostVisibilityValue>(
    `/posts/${postId}/visibility-rules`,
    { withCredentials: true },
  );

  return res.data;
}