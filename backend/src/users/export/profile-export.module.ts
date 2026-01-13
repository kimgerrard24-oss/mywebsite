// backend/src/users/export/profile-export.module.ts

import { Module, forwardRef } from '@nestjs/common';

import { ProfileExportController } from './profile-export.controller';
import { ProfileExportService } from './profile-export.service';
import { ProfileExportRepository } from './profile-export.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ProfileExportController],
  providers: [
    ProfileExportService,
    ProfileExportRepository,
  ],
})
export class ProfileExportModule {}
