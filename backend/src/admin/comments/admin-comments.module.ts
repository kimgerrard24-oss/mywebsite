// backend/src/admin/comments/admin-comments.module.ts

import { Module } from '@nestjs/common';
import { AdminCommentsController } from './admin-comments.controller';
import { AdminCommentsService } from './admin-comments.service';
import { AdminCommentsRepository } from './admin-comments.repository';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AuthModule } from '../../auth/auth.module';
import { AdminAuditModule } from '../audit/admin-audit.module';

@Module({
  imports: [ AdminAuditModule, AuthModule ],
  controllers: [AdminCommentsController],
  providers: [
    AdminCommentsService,
    AdminCommentsRepository,
    AdminRoleGuard,
  ],
})
export class AdminCommentsModule {}
