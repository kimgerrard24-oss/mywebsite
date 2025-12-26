// backend/src/notifications/dto/mark-notification-read.params.ts
import { IsUUID } from 'class-validator';

export class MarkNotificationReadParams {
  @IsUUID()
  id!: string;
}
