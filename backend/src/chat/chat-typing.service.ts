// backend/src/chat/chat-typing.service.ts

import { Injectable } from '@nestjs/common';

import { ChatPermissionService } from './chat-permission.service';
import { ChatRealtimeService } from './realtime/chat-realtime.service';
import { ChatTypingEvent } from './dto/chat-typing.event';

@Injectable()
export class ChatTypingService {
  constructor(
    private readonly permission: ChatPermissionService,
    private readonly realtime: ChatRealtimeService,
  ) {}

  async sendTyping(params: {
    chat: any;
    viewerUserId: string;
    isTyping: boolean;
  }) {
    const { chat, viewerUserId, isTyping } = params;

    /**
     * Permission check (backend authority)
     */
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    /**
     * Ephemeral typing event
     * - NOT persisted
     * - NOT retried
     * - Socket.IO is delivery-only
     */
    const event: ChatTypingEvent = {
      chatId: chat.id,
      userId: viewerUserId,
      isTyping,
      at: Date.now(),
    };

    /**
     * Emit via realtime layer
     * Socket.IO + redis-adapter handles fan-out
     */
    this.realtime.emitTyping(event);
  }
}
