// frontend/src/lib/api/admin-follows-moderation.ts

import { apiPost } from "@/lib/api/api";

export type ForceRemoveFollowReason =
  | "HARASSMENT"
  | "SPAM"
  | "SCAM"
  | "POLICY_VIOLATION"
  | "OTHER";

export async function forceRemoveFollow(
  followId: string,
  payload: {
    reason: ForceRemoveFollowReason;
    note?: string;
  },
): Promise<void> {
  if (!followId) {
    throw new Error("followId is required");
  }

  if (!payload.reason) {
    throw new Error("reason is required");
  }

  await apiPost(
    `/moderation/follows/${followId}/force-remove`,
    {
      reason: payload.reason,
      note: payload.note?.trim() || undefined,
    },
    {
      withCredentials: true, // 🔒 HttpOnly cookie
    },
  );
}
