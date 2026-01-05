// backend/src/admin/users/admin-users.module.ts
import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AuthModule } from '../../auth/auth.module';
import { AdminAuditModule } from '../audit/admin-audit.module';
import { RevokeUserSessionsModule } from '../../auth/services/revoke-user-sessions.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    AdminAuditModule,
    AuthModule,
    PrismaModule, 
    RevokeUserSessionsModule,
    ],
  controllers: [AdminUsersController],
  providers: [
    AdminUsersService,
    AdminUsersRepository,
    AdminRoleGuard,
  ],
})
export class AdminUsersModule {}
