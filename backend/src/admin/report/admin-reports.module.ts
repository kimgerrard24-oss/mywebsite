// backend/src/admin/report/admin-reports.module.ts

import { Module } from '@nestjs/common';
import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';
import { AdminReportsRepository } from './admin-reports.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ AuthModule, PrismaModule, ],
  controllers: [AdminReportsController],
  providers: [
    AdminReportsService,
    AdminReportsRepository,

    // 🔒 Register guard for DI (NOT global)
    AdminRoleGuard,
  ],
})
export class AdminReportsModule {}
