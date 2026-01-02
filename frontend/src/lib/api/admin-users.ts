// frontend/src/lib/api/admin-users.ts
import { apiGet } from "@/lib/api/api";
import type { AdminUsersResponse } from "@/types/admin-user";

export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminUsersResponse> {
  const { page, limit, search } = params;

  return apiGet<AdminUsersResponse>("/admin/users", {
    params: {
      page,
      limit,
      search,
    },
    withCredentials: true, // 🔒 HttpOnly cookie
  });
}
