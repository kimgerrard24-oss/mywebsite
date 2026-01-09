// frontend/src/lib/api/admin-moderation.ts

import { apiPost, apiPath } from "@/lib/api/api";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ==========================================
 * POST /admin/moderation/actions
 * ==========================================
 *
 * Admin-only moderation action
 *
 * - Backend is authority
 * - Auth via HttpOnly cookie (CSR)
 */
export async function createModerationAction(
  input: CreateModerationActionInput,
): Promise<ModerationActionResult> {
  // UX guard only — backend is authority
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
      withCredentials: true,
    },
  );
}

/**
 * ==========================================
 * GET /moderation/post/:id
 * ==========================================
 *
 * - SSR: manual Cookie forward
 * - CSR: browser cookie
 *
 * Backend is authority
 */
export async function getModeratedPostDetail(params: {
  postId: string;
  cookieHeader?: string;
}) {
  // 🔒 SSR path
  if (params.cookieHeader) {
    const res = await fetch(
      apiPath(`/moderation/post/${params.postId}`),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: params.cookieHeader,
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status}`,
      );
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  // ✅ CSR path
  const res = await fetch(
    apiPath(`/moderation/post/${params.postId}`),
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `HTTP ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return res.json();
}
