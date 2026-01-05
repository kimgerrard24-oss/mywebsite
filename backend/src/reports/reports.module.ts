// backend/src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { ReportCreatePolicy } from './policy/report-create.policy';
import { ReportAudit } from './audit/report.audit';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportWithdrawPolicy } from './policy/report-withdraw.policy';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsRepository,
    ReportCreatePolicy,
    ReportAudit,
    ReportWithdrawPolicy,
  ],
})
export class ReportsModule {}
