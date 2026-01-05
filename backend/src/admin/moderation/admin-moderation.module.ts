// backend/src/admin/moderation/admin-moderation.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminModerationService } from './admin-moderation.service';
import { AdminModerationRepository } from './admin-moderation.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ AuthModule, PrismaModule, ],
  controllers: [AdminModerationController],
  providers: [
    AdminModerationService,
    AdminModerationRepository,
  ],
})
export class AdminModerationModule {}


