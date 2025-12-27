// backend/src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatPermissionService } from './chat-permission.service';
import { AuthModule } from '../auth/auth.module';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatMessageRepository } from './chat-message.repository';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessageAuditService } from './audit/chat-message-audit.service';
import { ChatTypingController } from './chat-typing.controller';
import { ChatTypingService } from './chat-typing.service';

@Module({
  imports: [AuthModule],
  controllers: [
     ChatController,
     ChatMessagesController,
     ChatTypingController
    ],
  providers: [
    ChatService,
    ChatRepository,
    ChatTypingService,
    ChatPermissionService,
    ChatMessagesService,
    ChatMessageRepository,
    ChatPermissionService,
    ChatMessageAuditService,
  ],
})
export class ChatModule {}
