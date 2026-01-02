// frontend/src/lib/api/admin-ban-user.ts

import { apiPut } from "@/lib/api/api";
import type {
  BanUserPayload,
  BanUserResponse,
} from "@/types/admin-ban-user";

/**
 * ==============================
 * Ban user
 * ==============================
 *
 * PUT /admin/users/:id/ban
 */
export async function banUser(
  userId: string,
  payload: BanUserPayload,
): Promise<BanUserResponse> {
  return apiPut<BanUserResponse>(
    `/admin/users/${userId}/ban`,
    payload,
    {
      withCredentials: true, // 🔒 HttpOnly cookie auth
    },
  );
}

/**
 * ==============================
 * Unban user
 * ==============================
 *
 * PUT /admin/users/:id/unban
 *
 * ⚠️ Backend must enforce permission & audit
 */
export async function unbanUser(
  userId: string,
): Promise<BanUserResponse> {
  return apiPut<BanUserResponse>(
    `/admin/users/${userId}/unban`,
    undefined,
    {
      withCredentials: true, // 🔒 HttpOnly cookie auth
    },
  );
}
