// frontend/src/lib/api/admin-moderation.ts

import { apiPost, api } from "@/lib/api/api";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

/**
 * ==========================================
 * POST /admin/moderation/actions
 * ==========================================
 *
 * Admin-only moderation action
 *
 * - Supports: HIDE / UNHIDE / BAN_USER / etc.
 * - Backend is the sole authority
 * - Auth via HttpOnly cookie (SSR / CSR safe)
 * - No optimistic state here (fail-safe)
 */
export async function createModerationAction(
  input: CreateModerationActionInput,
): Promise<ModerationActionResult> {
  /**
   * ==============================
   * Client-side safety (non-authority)
   * ==============================
   *
   * - Prevent accidental empty reason
   * - Prevent undefined targetId
   * - Backend still validates everything
   */
  if (!input.targetId) {
    throw new Error(
      "targetId is required for moderation action",
    );
  }

  if (!input.reason?.trim()) {
    throw new Error(
      "reason is required for moderation action",
    );
  }

  return apiPost<ModerationActionResult>(
    "/admin/moderation/actions",
    {
      ...input,
      reason: input.reason.trim(),
    },
    {
      withCredentials: true, // 🔒 HttpOnly cookie
    },
  );
}

export async function getModeratedPostDetail(params: {
  postId: string;
  cookie?: string;
}) {
  const res = await api.get(
    `/moderation/post/${params.postId}`,
    {
      headers: params.cookie
        ? { cookie: params.cookie }
        : undefined,
      withCredentials: true,
    },
  );

  return res.data;
}