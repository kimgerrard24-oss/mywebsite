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
import { UsersModule } from '../users/users.module';
import { ReportFollowRequestAudit } from './audit/report-follow-request.audit';
import { ReportFollowRequestSecurityEvent } from './events/report-follow-request.security.event';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule,
    ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsRepository,
    ReportCreatePolicy,
    ReportAudit,
    ReportFollowRequestAudit,
    ReportWithdrawPolicy,
    ReportFollowRequestSecurityEvent,
  ],
})
export class ReportsModule {}
