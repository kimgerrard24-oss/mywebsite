// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserProfileAudit } from './audit/user-profile.audit';
import { AuditLogService } from './audit/audit-log.service';
import { R2Service } from '../r2/r2.service';
import { AvatarService } from './avatar/avatar.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,  
    UsersRepository,
    UserProfileAudit,
    AvatarService,
    R2Service,
    AuditLogService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
