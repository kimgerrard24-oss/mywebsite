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

@Module({
  imports: [PrismaModule, AuthModule, R2Module, ],
  controllers: [UsersController],
  providers: [
    UsersService,  
    UsersRepository,
    UserProfileAudit,
    AvatarService,
    CoverService,
    AuditLogService,
    UserSearchPolicy,
  ],
  exports: [UsersService],
})
export class UsersModule {}
