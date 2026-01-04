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
import { UseGuards,Logger } from '@nestjs/common';
import { WsAuthGuard } from './ws-auth.guard';

@WebSocketGateway({
  path: '/socket.io', // must match RedisIoAdapter
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly realtime: ChatRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('[afterInit] ChatGateway initialized');
    this.realtime.bindServer(server);
  }

  /**
   * Socket connection lifecycle
   * - Auth & user room join handled by RedisIoAdapter
   */
  handleConnection(client: Socket) {
    this.logger.debug(
      `[handleConnection] socket connected id=${client.id}`,
    );
  }

  /**
   * Join chat room
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): { joined: true } | void {
    if (!data?.chatId) {
      this.logger.warn(
        `[chat:join] missing chatId (socket=${client.id})`,
      );
      return;
    }

    const user = (client as any).user;
    if (!user) {
      this.logger.error(
        `[chat:join] user missing after guard (socket=${client.id})`,
      );
      return;
    }

    client.join(`chat:${data.chatId}`);

    this.logger.log(
      `[chat:join] user=${user.userId} socket=${client.id} joined chat:${data.chatId}`,
    );

    return { joined: true };
  }

  /**
   * Leave chat room
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!data?.chatId) {
      this.logger.warn(
        `[chat:leave] missing chatId (socket=${client.id})`,
      );
      return;
    }

    client.leave(`chat:${data.chatId}`);

    this.logger.log(
      `[chat:leave] socket=${client.id} left chat:${data.chatId}`,
    );
  }
}
