// frontend/src/lib/api/admin-actions.ts

import { apiGet, apiPath } from '@/lib/api/api';
import type { AdminAction } from '@/types/admin-action';

type ListParams = {
  page?: number;
  limit?: number;
  actionType?: string;
  targetType?: string;
};

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ==============================
 * GET /admin/actions
 * ==============================
 *
 * - CSR: use axios (apiGet)
 * - SSR: use fetch + Cookie (backend authority)
 */
export async function getAdminActions(
  params: ListParams,
  ctx?: SSRContext,
): Promise<{
  items: AdminAction[];
  total: number;
}> {
  // 🔒 SSR path (production-critical)
  if (ctx?.cookieHeader) {
    const url = new URL(
      apiPath('/admin/actions'),
    );

    Object.entries(params).forEach(
      ([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(
            key,
            String(value),
          );
        }
      },
    );

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: ctx.cookieHeader,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status}`,
      );
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  // ✅ CSR path
  return apiGet('/admin/actions', {
    params,
    withCredentials: true,
  });
}

/**
 * ==============================
 * GET /admin/actions/:id
 * ==============================
 *
 * - SSR: fetch + Cookie
 * - CSR: fetch (client-side navigation)
 */
export async function getAdminActionById(
  id: string,
  ctx?: SSRContext,
): Promise<AdminAction> {
  // 🔒 SSR
  if (ctx?.cookieHeader) {
    const res = await fetch(
      apiPath(`/admin/actions/${id}`),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie: ctx.cookieHeader,
        },
        credentials: 'include',
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status}`,
      );
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  // ✅ CSR
  const res = await fetch(
    apiPath(`/admin/actions/${id}`),
    {
      credentials: 'include',
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `HTTP ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return res.json();
}
