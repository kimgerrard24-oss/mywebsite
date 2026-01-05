// frontend/src/lib/api/admin-moderation.ts

import { apiPost } from "@/lib/api/api";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

/**
 * ==============================
 * POST /admin/moderation/actions
 * ==============================
 *
 * - Client-side only
 * - Backend is the sole authority
 * - Auth via HttpOnly cookie
 */
export async function createModerationAction(
  input: CreateModerationActionInput,
): Promise<ModerationActionResult> {
  return apiPost<ModerationActionResult>(
    "/admin/moderation/actions",
    input,
    {
      withCredentials: true,
    },
  );
}
