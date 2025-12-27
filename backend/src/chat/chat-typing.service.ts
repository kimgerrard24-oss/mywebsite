// backend/src/chat/chat-typing.service.ts
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { ChatRepository } from './chat.repository';
import { ChatPermissionService } from './chat-permission.service';
import { ChatTypingEvent } from './dto/chat-typing.event';

@Injectable()
export class ChatTypingService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly permission: ChatPermissionService,

    // ✅ inject redis singleton ตรง ๆ
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async sendTyping(params: {
    chat: any;
    viewerUserId: string;
    isTyping: boolean;
  }) {
    const { chat, viewerUserId, isTyping } = params;

    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    const event: ChatTypingEvent = {
      chatId: chat.id,
      userId: viewerUserId,
      isTyping,
      at: Date.now(),
    };

    // ✅ publish ตรง
    await this.redis.publish(
      `chat:typing:${chat.id}`,
      JSON.stringify(event),
    );
  }
}
