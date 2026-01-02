// backend/src/admin/posts/admin-posts.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

import { AdminPostsController } from './admin-posts.controller';
import { AdminPostsService } from './admin-posts.service';
import { AdminPostsRepository } from './admin-posts.repository';

import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AdminAuditService } from '../audit/admin-audit.service';
import { AuthModule } from '../../auth/auth.module';
import { AdminAuditModule } from '../audit/admin-audit.module';

@Module({
  imports: [
    AdminAuditModule,
    AuthModule, 
    PrismaModule,
  ],
  controllers: [
    AdminPostsController,
  ],
  providers: [
    AdminPostsService,
    AdminPostsRepository,
    AdminRoleGuard,
    AdminAuditService,
  ],
})
export class AdminPostsModule {}
