// backend/src/notifications/types/notification-create.input.ts

import { NotificationPayloadMap } from './notification-payload.type';

export type NotificationCreateInput<T extends keyof NotificationPayloadMap> = {
  userId: string;
  actorUserId: string;
  type: T;
  entityId: string;
  payload: NotificationPayloadMap[T];
};
