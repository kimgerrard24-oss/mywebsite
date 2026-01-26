// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AvatarService } from './avatar/avatar.service';
import { R2Module } from '../r2/r2.module';
import { CoverService } from './cover/cover.service';
import { UserSearchPolicy } from './policies/user-search.policy';
import { NotificationsModule } from '../notifications/notifications.module';
import { MentionController } from './mention/mention.controller';
import { MentionService } from './mention/mention.service';
import { UserBlockService } from './user-block/user-block.service';
import { UserBlockRepository } from './user-block/user-block.repository';
import { UserBlockPolicy } from './user-block/policy/user-block.policy';
import { UserBlockController } from './user-block/user-block.controller';
import { CredentialVerificationService } from '../auth/credential-verification.service';
import { PhoneModule } from '../identities/phone/phone.module';
import { ProfileExportModule } from './export/profile-export.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from '../mail/mail.module';
import { UsersPrivacyModule } from './privacy/users-privacy.module';
import { FollowsModule } from '../follows/follows.module';
import { FollowingModule } from '../following/following.module';
import { UserTaggedPostsViewPolicy } from './policies/user-tagged-posts-view.policy';
import { UserTagSettingsAudit } from './audit/user-tag-settings.audit';
import { UserTagSettingsUpdatePolicy } from './policies/user-tag-settings-update.policy';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    R2Module,
    UsersPrivacyModule, 
    MailModule,
    FollowsModule,
    FollowingModule,
    NotificationsModule,
    forwardRef(() => ProfileExportModule),
    AuditModule,
    PhoneModule,
  ],
  controllers: [ UsersController, UserBlockController, MentionController,],
  providers: [
    UsersService,  
    UsersRepository,
    AvatarService,
    CoverService,
    UserTagSettingsAudit,
    UserTagSettingsUpdatePolicy,
    MentionService,
    UserSearchPolicy,
    UserTaggedPostsViewPolicy,
    UserBlockService,
    UserBlockRepository,
    UserBlockPolicy,
    CredentialVerificationService,
  ],
  exports: [UsersService, UsersRepository,],
})
export class UsersModule {}
