// backend/src/feed/realtime/feed.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FeedRealtimeService } from './feed-realtime.service';
import { WsAuthGuard } from '../../chat/realtime/ws-auth.guard';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class FeedGateway
  implements OnGatewayInit
{
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly realtime: FeedRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;

    // per-user feed room
    client.join(`user:${user.userId}`);
  }
}
