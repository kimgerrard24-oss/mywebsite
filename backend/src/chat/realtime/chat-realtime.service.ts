// backend/src/chat/realtime/chat-realtime.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_EVENTS,
  ChatNewMessageEvent,
  ChatMessageDeletedEvent,
  ChatTypingEvent,
} from './ws.types';

@Injectable()
export class ChatRealtimeService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  /**
   * ============================
   * New message
   * ============================
   */
  emitNewMessage(event: ChatNewMessageEvent) {
    if (!this.server) return;

    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_NEW_MESSAGE, event);
  }

  /**
   * ============================
   * Message deleted
   * ============================
   */
  emitMessageDeleted(event: ChatMessageDeletedEvent) {
    if (!this.server) return;

    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_MESSAGE_DELETED, event);
  }

  /**
   * ============================
   * Typing (ephemeral)
   * ============================
   */
  emitTyping(event: ChatTypingEvent) {
    if (!this.server) return;

    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_TYPING, event);
  }
}
