// backend/src/moderation/user/user-moderation.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { AdminActionLogService } from '../../admin/audit/admin-action-log.service';
import { UserModerationController } from './user-moderation.controller';
import { UserModerationService } from './user-moderation.service';
import { UserModerationRepository } from './user-moderation.repository';
import { AdminRoleGuard } from '../../admin/guards/admin-role.guard';
import { AdminUpdateIdentityService } from '../../admin/admin-update-identity.service';
import { ModerationUsersController } from '../moderationcontroller/moderation-users.controller';
import { SecuritiesModule } from '../../securities/securities.module';

@Module({
  imports: [PrismaModule, SecuritiesModule, AuthModule],
  controllers: [UserModerationController, ModerationUsersController],
  providers: [
    UserModerationService, 
    UserModerationRepository,
    AdminRoleGuard,
    AdminActionLogService,
    AdminUpdateIdentityService,
],
})
export class UserModerationModule {}
