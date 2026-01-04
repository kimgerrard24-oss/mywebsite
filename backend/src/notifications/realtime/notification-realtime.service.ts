// backend/src/notifications/realtime/notification-realtime.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_NOTIFICATION_EVENTS,
  NotificationNewEvent,
} from './ws.types';

@Injectable()
export class NotificationRealtimeService {
  private readonly logger = new Logger(
    NotificationRealtimeService.name,
  );

  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;

    this.logger.log(
      '[bindServer] Socket.IO server bound to NotificationRealtimeService',
    );
  }

  /**
   * Emit notification ไปหา user คนเดียว
   * ❗ ต้องเรียกหลัง DB commit เท่านั้น
   */
  emitNewNotification(
    userId: string,
    payload: NotificationNewEvent,
  ) {
    if (!this.server) {
      this.logger.error(
        `[emitNewNotification] server not bound (userId=${userId})`,
      );
      return;
    }

    if (!userId) {
      this.logger.warn(
        '[emitNewNotification] missing userId',
      );
      return;
    }

    this.logger.log(
      `[emitNewNotification] emit event=${WS_NOTIFICATION_EVENTS.NEW} to room=user:${userId}`,
    );

    this.server
      .to(`user:${userId}`)
      .emit(
        WS_NOTIFICATION_EVENTS.NEW,
        payload,
      );
  }
}
