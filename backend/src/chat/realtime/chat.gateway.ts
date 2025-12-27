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
@UseGuards(WsAuthGuard)
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
    const user = (client as any).user;
    if (!user) return;

    // user room (optional for notification later)
    client.join(`user:${user.userId}`);
  }

  /**
   * Client ขอ join ห้องแชท
   * ❗ backend ยังเป็น authority (client ขอ แต่ backend ตัดสิน)
   */
  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;
    client.join(`chat:${data.chatId}`);
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;
    client.leave(`chat:${data.chatId}`);
  }
}
