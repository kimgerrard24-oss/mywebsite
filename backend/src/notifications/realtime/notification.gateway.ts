// backend/src/notifications/realtime/notification.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationRealtimeService } from './notification-realtime.service';

@WebSocketGateway({
  path: '/socket.io', // ✅ CRITICAL: must match RedisIoAdapter
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayInit {
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
    this.realtime.bindServer(server);
  }
}
