// frontend/src/lib/api/admin-ban-user.ts

import { apiPut } from "@/lib/api/api";
import type {
  BanUserPayload,
  BanUserResponse,
} from "@/types/admin-ban-user";

/**
 * ==============================
 * Ban / Unban user (single route)
 * ==============================
 *
 * PUT /admin/users/:id/ban
 *
 * Payload:
 * - { banned: true,  reason: string }  -> Ban
 * - { banned: false }                  -> Unban
 *
 * Backend is the authority.
 */
export async function banUser(
  userId: string,
  payload: BanUserPayload,
): Promise<BanUserResponse> {
  return apiPut<BanUserResponse>(
    `/admin/users/${userId}/ban`,
    payload,
    {
      withCredentials: true, // HttpOnly cookie auth
    },
  );
}
