// backend/src/notifications/realtime/ws.types.ts

import { NotificationItemDto } from '../dto/notification-item.dto';

export const WS_NOTIFICATION_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
} as const;

export type NotificationNewEvent = {
  notification: NotificationItemDto;
};

export type NotificationReadEvent = {
  notificationId: string;
};
