// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserProfileAudit } from './audit/user-profile.audit';
import { AuditLogService } from './audit/audit-log.service';
import { AvatarService } from './avatar/avatar.service';
import { R2Module } from '../r2/r2.module';
import { CoverService } from './cover/cover.service';
import { UserSearchPolicy } from './policies/user-search.policy';
import { NotificationsModule } from '../notifications/notifications.module';
import { MentionController } from './mention/mention.controller';
import { MentionService } from './mention/mention.service';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    R2Module, 
    NotificationsModule, 
  ],
  controllers: [UsersController, MentionController,],
  providers: [
    UsersService,  
    UsersRepository,
    UserProfileAudit,
    AvatarService,
    CoverService,
    AuditLogService,
    MentionService,
    UserSearchPolicy,
  ],
  exports: [UsersService],
})
export class UsersModule {}
