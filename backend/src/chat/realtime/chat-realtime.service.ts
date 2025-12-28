// backend/src/chat/realtime/chat-realtime.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_EVENTS,
  ChatNewMessageEvent,
  ChatMessageDeletedEvent,
} from './ws.types';

@Injectable()
export class ChatRealtimeService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitNewMessage(event: ChatNewMessageEvent) {
    if (!this.server) return;

    // fan-out ตาม chat room
    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_NEW_MESSAGE, event);
  }

  emitMessageDeleted(event: ChatMessageDeletedEvent) {
    if (!this.server) return;

    // fan-out ตาม chat room
    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_MESSAGE_DELETED, event);
  }
}
