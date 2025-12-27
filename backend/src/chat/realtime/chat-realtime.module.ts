// src/chat/realtime/chat-realtime.module.ts

import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatRealtimeService } from './chat-realtime.service';
import { WsAuthGuard } from './ws-auth.guard';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    ChatGateway,
    ChatRealtimeService,
    WsAuthGuard,
  ],
  exports: [ChatRealtimeService],
})
export class ChatRealtimeModule {}
