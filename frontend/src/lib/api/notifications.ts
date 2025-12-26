// frontend/src/lib/api/notifications.ts

import { apiGet, apiPut } from '@/lib/api/api';
import type { NotificationResponse } from '@/types/notification';

/**
 * GET /notifications
 */
export async function getNotifications(params: {
  cursor?: string | null;
  limit?: number;
}): Promise<NotificationResponse> {
  return apiGet<NotificationResponse>('/notifications', {
    params,
  });
}

/**
 * PUT /notifications/:id/read
 */
export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await apiPut(`/notifications/${notificationId}/read`);
}

/**
 * PUT /notifications/read-all
 */
export async function markAllNotificationsRead(): Promise<{
  success: boolean;
  updatedCount?: number;
}> {
  return apiPut('/notifications/read-all');
}
