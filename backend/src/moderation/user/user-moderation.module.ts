// backend/src/moderation/user/user-moderation.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

import { UserModerationController } from './user-moderation.controller';
import { UserModerationService } from './user-moderation.service';
import { UserModerationRepository } from './user-moderation.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserModerationController],
  providers: [UserModerationService, UserModerationRepository],
})
export class UserModerationModule {}
