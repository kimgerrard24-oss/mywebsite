// backend/src/profile-update/cover-update.module.ts

import { Module } from '@nestjs/common';
import { CoverUpdateController } from './cover-update.controller';
import { CoverUpdateService } from './cover-update.service';
import { CoverUpdateRepository } from './cover-update.repository';
import { CoverUpdateTransaction } from './cover-update.transaction';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { AuditLogService } from '../users/audit/audit-log.service';
import { ProfileMediaRepository } from '../profile/profile-media.repository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../users/audit/audit.module';

@Module({
  imports: [
      PrismaModule, 
      AuthModule, 
      UsersModule,
      AuditModule,
      ],
  controllers: [CoverUpdateController],
  providers: [
    CoverUpdateService,
    CoverUpdateRepository,
    CoverUpdateTransaction,
    PrismaService,
    PostsService,
    AuditLogService,
    ProfileMediaRepository,
  ],
})
export class CoverUpdateModule {}
