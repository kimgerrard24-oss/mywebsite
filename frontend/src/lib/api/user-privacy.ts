// frontend/src/lib/api/user-privacy.ts

import { apiPatch } from "./api";
import type { UpdatePostPrivacyResponse } from "@/types/user-privacy";

/**
 * PATCH /api/users/me/privacy
 * Backend authority
 */
export async function updateMyPrivacy(
  isPrivate: boolean,
): Promise<{ id: string; isPrivate: boolean }> {
  return apiPatch("/users/me/privacy", { isPrivate });
}

/**
 * PATCH /api/users/me/post-privacy
 * Backend authority
 */
export async function updateMyPostPrivacy(
  isPrivate: boolean,
): Promise<UpdatePostPrivacyResponse> {
  return apiPatch("/users/me/post-privacy", { isPrivate });
}
