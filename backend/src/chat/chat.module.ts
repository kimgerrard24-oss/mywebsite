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
import { ChatRealtimeModule } from './realtime/chat-realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationRealtimeModule } from '../notifications/realtime//notification-realtime.module';
import { ChatReportController } from './chat-report.controller';
import { ChatReportService } from './chat-report.service';
import { ChatReportRepository } from './chat-report.repository';

@Module({
  imports: [ChatRealtimeModule, AuthModule, NotificationsModule, NotificationRealtimeModule],
  controllers: [
     ChatController,
     ChatMessagesController,
     ChatTypingController,
     ChatReportController,
    ],
  providers: [
    ChatService,
    ChatReportService,       
    ChatReportRepository,     
    ChatRepository,
    ChatTypingService,
    ChatPermissionService,
    ChatMessagesService,
    ChatMessageRepository,
    ChatPermissionService,
    ChatMessageAuditService,
  ],
   exports: [
    ChatMessagesService, 
  ],
})
export class ChatModule {}
