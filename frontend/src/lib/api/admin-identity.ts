// frontend/src/lib/api/admin-identity.ts

import { apiPost } from "./api";
import type {
  AdminUpdateIdentityPayload,
  AdminUpdateIdentityResponse,
} from "@/types/admin-identity";

/**
 * POST /moderation/users/:id/update-identity
 * Backend authority
 */
export async function adminUpdateUserIdentity(
  userId: string,
  payload: AdminUpdateIdentityPayload,
): Promise<AdminUpdateIdentityResponse> {
  return apiPost(
    `/moderation/users/${userId}/update-identity`,
    payload,
  );
}
