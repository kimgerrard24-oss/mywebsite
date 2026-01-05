// frontend/src/lib/api/admin-users.ts

import type { GetServerSidePropsContext } from "next";
import { apiPath } from "@/lib/api/api";
import type { AdminUsersResponse, AdminUserDetail  } from "@/types/admin-user";
import { apiGet } from "@/lib/api/api";
/**
 * ==============================
 * Admin Users (SSR + CSR Safe)
 * ==============================
 *
 * - SSR: ใช้ fetch + Cookie จาก ctx
 * - CSR: ใช้ fetch + credentials: include
 * - Backend เป็น authority (AdminRoleGuard)
 */
export async function getAdminUsers(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  },
  ctx?: GetServerSidePropsContext,
): Promise<AdminUsersResponse> {
  const { page, limit, search } = params;

  const qs = new URLSearchParams();
  if (page) qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit));
  if (search) qs.set("search", search);

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const res = await fetch(
    `${base.replace(/\/+$/, "")}/admin/users?${qs.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(ctx?.req.headers.cookie
          ? { Cookie: ctx.req.headers.cookie }
          : {}),
      },
      credentials: "include",
      cache: "no-store", // 🔒 admin data
    },
  );

  if (!res.ok) {
    const err: any = new Error("Failed to fetch admin users");
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as AdminUsersResponse;
}

export async function fetchAdminUserById(
  userId: string,
  params?: { cookieHeader?: string },
): Promise<AdminUserDetail> {
  return apiGet(`/admin/users/${userId}`, {
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
}  