// backend/src/admin/dashboard/admin-dashboard.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardRepository } from './admin-dashboard.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ AuthModule, PrismaModule, ],
  controllers: [AdminDashboardController],
  providers: [
    AdminDashboardService,
    AdminDashboardRepository,
  ],
})
export class AdminDashboardModule {}
