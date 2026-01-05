// frontend/src/lib/api/admin-actions.ts

import { apiGet, client } from '@/lib/api/api';
import type { AdminAction } from '@/types/admin-action';

export async function getAdminActions(params: {
  page?: number;
  limit?: number;
  actionType?: string;
  targetType?: string;
}) {
  return apiGet<{
    items: AdminAction[];
    total: number;
  }>('/admin/actions', {
    params,
    withCredentials: true,
  });
}

export async function getAdminActionById(
  id: string,
): Promise<AdminAction> {
  return client.get(`/admin/actions/${id}`);
}