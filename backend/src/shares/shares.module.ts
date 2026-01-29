// backend/src/shares/shares.module.ts

import { Module } from '@nestjs/common';

import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { SharesRepository } from './shares.repository';
import { SharesIntentService } from './shares-intent.service';
import { SharesIntentRepository } from './shares-intent.repository';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsModule } from '../notifications/notifications.module';
import { SharesExternalService } from './shares-external.service';
import { SharesExternalRepository } from './shares-external.repository';
import { ShareLinksModule } from '../shares/share-links/share-links.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule,
    NotificationsModule,
    ShareLinksModule,
    ChatModule,
  ],
  controllers: [SharesController],
  providers: [
    SharesService,
    SharesRepository,
    SharesIntentService,
    SharesIntentRepository,
    SharesExternalService,
    SharesExternalRepository,
  ],
  exports: [
    SharesIntentService, // เผื่อ future use (POST /shares)
  ], 
})
export class SharesModule {}
