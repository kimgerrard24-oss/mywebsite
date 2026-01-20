// frontend/src/lib/api/user-privacy.ts

import { apiPatch } from "./api";

/**
 * PATCH /api/users/me/privacy
 * Backend authority
 */
export async function updateMyPrivacy(
  isPrivate: boolean,
): Promise<{ id: string; isPrivate: boolean }> {
  return apiPatch("/users/me/privacy", { isPrivate });
}
