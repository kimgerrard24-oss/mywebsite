// backend/src/users/privacy/users-privacy.module.ts

import { Module } from '@nestjs/common';
import { UsersPrivacyController } from './users-privacy.controller';
import { UsersPrivacyService } from './users-privacy.service';
import { AuthModule } from '../../auth/auth.module';
import { FollowingModule } from '../../following/following.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { PrivacyRepository } from './privacy.repository';
import { PostPrivacyAudit } from './audit/post-privacy.audit';
import { PostPrivacyChangedEvent } from './events/post-privacy-changed.event';
import { FeedCacheService } from '../../feed/cache/feed-cache.service';
import { PrivacyController } from './privacy.controller';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    FollowingModule,
  ],
  controllers: [
    UsersPrivacyController,
    PrivacyController,
  ],
  providers: [
    UsersPrivacyService,
    PrivacyRepository,
    PostPrivacyAudit,
    PostPrivacyChangedEvent,
    FeedCacheService,
  ],
  exports: [UsersPrivacyService],
})
export class UsersPrivacyModule {}
