// backend/src/notifications/types/notification-create.input.ts

import { NotificationPayloadMap } from './notification-payload.type';

/**
 * NotificationCreateInput
 *
 * - Input contract สำหรับการสร้าง notification
 * - ผูก type ↔ payload แบบ type-safe
 * - รองรับทั้ง canonical และ legacy notification types
 *
 * Canonical types (แนะนำให้ใช้):
 * - comment
 * - like
 * - follow
 * - chat
 *
 * Legacy types (ยังรองรับเพื่อ backward compatibility):
 * - chat_message
 *
 * หมายเหตุ:
 * - Domain services (follow / like / comment / post / chat)
 *   ควรเรียกผ่าน NotificationsService เท่านั้น
 * - Realtime delivery ถูกจัดการภายใน notification layer
 */
export type NotificationCreateInput<
  T extends keyof NotificationPayloadMap = keyof NotificationPayloadMap,
> = {
  /**
   * ผู้รับ notification
   */
  userId: string;

  /**
   * ผู้กระทำ (actor)
   */
  actorUserId: string;

  /**
   * ประเภท notification
   * - ควรใช้ canonical type เมื่อเป็น code ใหม่
   */
  type: T;

  /**
   * entity หลักที่ notification อ้างถึง
   * - postId / chatId / userId
   */
  entityId: string;

  /**
   * payload ตาม type ของ notification
   * - type-safe โดยอัตโนมัติจาก generic T
   */
  payload: NotificationPayloadMap[T];
};
