// frontend/src/lib/api/admin-moderation.ts

import { apiPost } from "@/lib/api/api";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

export async function createModerationAction(
  input: CreateModerationActionInput,
): Promise<ModerationActionResult> {
  return apiPost("/admin/moderation/actions", input);
}
