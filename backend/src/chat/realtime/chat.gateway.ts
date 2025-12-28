// backend/src/chat/realtime/chat.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRealtimeService } from './chat-realtime.service';
import { WsAuthGuard } from './ws-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly realtime: ChatRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  handleConnection(client: Socket) {
    // ❗ ห้ามพึ่ง guard ที่นี่
    // auth จะถูกตรวจตอน join แทน
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): { joined: true } | void {
    if (!data?.chatId) return;

    const user = (client as any).user;
    if (!user) return;

    client.join(`user:${user.userId}`);
    client.join(`chat:${data.chatId}`);

    return { joined: true };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;

    client.leave(`chat:${data.chatId}`);
  }
}

