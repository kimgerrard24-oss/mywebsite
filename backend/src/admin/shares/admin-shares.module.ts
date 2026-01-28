// backend/src/admin/shares/shares.module.ts

import { Module } from '@nestjs/common';

import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { SharesRepository } from './shares.repository';
import { ShareAuditService } from './audit/share-audit.service';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
      AuthModule,
      PrismaModule, 
      NotificationsModule,
    ],
  controllers: [SharesController],
  providers: [
    SharesService,
    SharesRepository,
    ShareAuditService,
  ],
})
export class AdminSharesModule {}
