// backend/src/notifications/realtime/notification.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationRealtimeService } from './notification-realtime.service';

@WebSocketGateway({
  path: '/socket.io', // ✅ CRITICAL: must match RedisIoAdapter
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayInit {
  private readonly logger = new Logger(
    NotificationGateway.name,
  );

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly realtime: NotificationRealtimeService,
  ) {}

  /**
   * Bind Socket.IO server instance
   * - Server lifecycle only
   * - Auth & room join handled by RedisIoAdapter
   */
  afterInit(server: Server) {
    this.logger.log(
      '[afterInit] NotificationGateway initialized',
    );

    if (!server) {
      this.logger.error(
        '[afterInit] Socket.IO server is undefined',
      );
      return;
    }

    this.logger.log(
      `[afterInit] Socket.IO server attached (engine=${server.engine?.constructor?.name ?? 'unknown'})`,
    );

    this.realtime.bindServer(server);

    this.logger.log(
      '[afterInit] NotificationRealtimeService.bindServer() called',
    );
  }
}
