// backend/src/users/privacy/users-privacy.module.ts

import { Module } from '@nestjs/common';

import { UsersPrivacyController } from './users-privacy.controller';
import { UsersPrivacyService } from './users-privacy.service';
import { AuthModule } from '../../auth/auth.module';
import { FollowingModule } from '../../following/following.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    FollowingModule,
  ],
  controllers: [UsersPrivacyController],
  providers: [UsersPrivacyService],
  exports: [UsersPrivacyService],
})
export class UsersPrivacyModule {}
