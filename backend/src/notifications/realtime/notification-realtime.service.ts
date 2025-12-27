// backend/src/notifications/realtime/notification-realtime.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_NOTIFICATION_EVENTS,
  NotificationNewEvent,
} from './ws.types';

@Injectable()
export class NotificationRealtimeService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  /**
   * Emit notification ไปหา user คนเดียว
   * ❗ ต้องเรียกหลัง DB commit เท่านั้น
   */
  emitNewNotification(
    userId: string,
    payload: NotificationNewEvent,
  ) {
    if (!this.server) return;

    this.server
      .to(`user:${userId}`)
      .emit(
        WS_NOTIFICATION_EVENTS.NEW,
        payload,
      );
  }
}
