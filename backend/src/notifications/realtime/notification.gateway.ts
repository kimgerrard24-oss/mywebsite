// backend/src/notifications/realtime/notification.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationRealtimeService } from './notification-realtime.service';
import { WsAuthGuard } from '../../chat/realtime/ws-auth.guard';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class NotificationGateway
  implements OnGatewayInit
{
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly realtime: NotificationRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;

    /**
     * Notification realtime
     * - join per-user room
     * - 1 user = 1 room
     */
    client.join(`user:${user.userId}`);
  }
}
