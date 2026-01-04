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

@WebSocketGateway({
  path: '/socket.io', // ✅ CRITICAL: must match RedisIoAdapter
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

  /**
   * Socket connection lifecycle
   * - Auth & user room join handled by RedisIoAdapter
   */
  handleConnection(_client: Socket) {
    // intentionally empty
  }

  /**
   * Join chat room
   * - Assumes socket already authenticated
   */
  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): { joined: true } | void {
    if (!data?.chatId) return;

    const user = (client as any).user;
    if (!user) return;

    client.join(`chat:${data.chatId}`);

    return { joined: true };
  }

  /**
   * Leave chat room
   */
  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) return;

    client.leave(`chat:${data.chatId}`);
  }
}
