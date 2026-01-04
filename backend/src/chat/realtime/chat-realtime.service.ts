// backend/src/chat/realtime/chat-realtime.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  WS_EVENTS,
  ChatNewMessageEvent,
  ChatMessageDeletedEvent,
  ChatTypingEvent,
} from './ws.types';

@Injectable()
export class ChatRealtimeService {
  private readonly logger = new Logger(ChatRealtimeService.name);
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
    this.logger.log('[bindServer] Socket.IO server bound');
  }

  /**
   * ============================
   * New message
   * ============================
   */
  emitNewMessage(event: ChatNewMessageEvent) {
    if (!this.server) {
      this.logger.warn(
        `[emitNewMessage] skipped: server not initialized (chatId=${event.chatId})`,
      );
      return;
    }

    this.logger.debug(
      `[emitNewMessage] chatId=${event.chatId} event=${WS_EVENTS.CHAT_NEW_MESSAGE}`,
    );

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
    if (!this.server) {
      this.logger.warn(
        `[emitMessageDeleted] skipped: server not initialized (chatId=${event.chatId})`,
      );
      return;
    }

    this.logger.debug(
      `[emitMessageDeleted] chatId=${event.chatId} messageId=${event.messageId}`,
    );

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
    if (!this.server) {
      this.logger.warn(
        `[emitTyping] skipped: server not initialized (chatId=${event.chatId})`,
      );
      return;
    }

    this.logger.debug(
      `[emitTyping] chatId=${event.chatId} userId=${event.userId} isTyping=${event.isTyping}`,
    );

    this.server
      .to(`chat:${event.chatId}`)
      .emit(WS_EVENTS.CHAT_TYPING, event);
  }
}
