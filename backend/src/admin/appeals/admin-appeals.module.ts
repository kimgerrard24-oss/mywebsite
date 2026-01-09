// backend/src/admin/appeals/admin-appeals.module.ts

import { Module } from '@nestjs/common';
import { AdminAppealsController } from './admin-appeals.controller';
import { AdminAppealsService } from './admin-appeals.service';
import { AdminAppealsRepository } from './admin-appeals.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAppealStatsCache } from './admin-appeal-stats.cache';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    PrismaModule, 
    NotificationsModule,
    AuthModule,
  ],
  controllers: [AdminAppealsController],
  providers: [
    AdminAppealsService,
    AdminAppealsRepository,
    AdminAppealStatsCache,
  ],
})
export class AdminAppealsModule {}

