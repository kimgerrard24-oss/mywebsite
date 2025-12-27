// frontend/src/components/notifications/NotificationRealtimeBridge.tsx

import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';

/**
 * Mount once (e.g. in AppLayout)
 * No UI
 * No side effects
 */
export default function NotificationRealtimeBridge() {
  useNotificationRealtime();
  return null;
}
