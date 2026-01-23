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
   * Emit notification to single user room
   * Must be called AFTER DB commit
   */
  emitNewNotification(
    userId: string,
    payload: NotificationNewEvent,
  ) {
    if (!this.server || !this.server.sockets) {
      this.logger.error(
        `[emitNewNotification] socket server not ready (userId=${userId})`,
      );
      return;
    }

    if (!userId) {
      this.logger.warn(
        '[emitNewNotification] missing userId',
      );
      return;
    }

    this.logger.debug(
      `[emitNewNotification] event=${WS_NOTIFICATION_EVENTS.NEW} user=${userId}`,
    );

    this.server
      .to(`user:${userId}`)
      .volatile // feed invalidate = UX only
      .emit(
        WS_NOTIFICATION_EVENTS.NEW,
        payload,
      );
  }
}

