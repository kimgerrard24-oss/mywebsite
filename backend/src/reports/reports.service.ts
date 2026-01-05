// backend/src/reports/reports.service.ts

import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { ReportCreatePolicy } from './policy/report-create.policy';
import { ReportAudit } from './audit/report.audit';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportItemDto } from './dto/report-item.dto';
import { ReportDetailDto } from './dto/report-detail.dto';
import { ReportWithdrawPolicy } from './policy/report-withdraw.policy';

@Injectable()
export class ReportsService {
  constructor(
    private readonly repo: ReportsRepository,
    private readonly policy: ReportCreatePolicy,
    private readonly audit: ReportAudit,
    private readonly withdrawpolicy: ReportWithdrawPolicy,
  ) {}

  async createReport(params: {
  reporterId: string;
  reporterEmail: string;
  dto: CreateReportDto;
}) {
  const { reporterId, reporterEmail, dto } = params;

  const duplicate =
    await this.repo.findDuplicate({
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

  if (duplicate) {
    throw new ConflictException(
      'Report already exists',
    );
  }

  this.policy.assertCanReport({
    reporterId,
  });

  await this.repo.create({
    reporterId,
    targetType: dto.targetType,
    targetId: dto.targetId,
    reason: dto.reason,
    description: dto.description,
  });

  await this.audit.reportCreated({
    userId: reporterId,
    email: reporterEmail, // ✅ ส่ง email
    targetType: dto.targetType,
    targetId: dto.targetId,
  });
}

async getMyReports(params: {
    reporterId: string;
    cursor: string | null;
    limit: number;
  }) {
    const result =
      await this.repo.findMyReports(params);

    return {
      items: result.items.map(
        ReportItemDto.fromEntity,
      ),
      nextCursor: result.nextCursor,
    };
  }
  

  async getMyReportById(params: {
    reporterId: string;
    reportId: string;
  }) {
    const report =
      await this.repo.findMyReportById(params);

    if (!report) {
      throw new NotFoundException(
        'Report not found',
      );
    }

    return ReportDetailDto.fromEntity(report);
  }

  async withdrawReport(params: {
  reporterId: string;
  reporterEmail: string;
  reportId: string;
}) {
  const { reporterId, reporterEmail, reportId } = params;

  /**
   * 1️⃣ Load report (IDOR protected at DB level)
   */
  const report = await this.repo.findForWithdraw({
    reportId,
    reporterId,
  });

  if (!report) {
    throw new NotFoundException('Report not found');
  }

  /**
   * 2️⃣ Enforce business rule (policy authority)
   * - Only PENDING reports can be withdrawn
   * - Policy layer is the single source of truth
   */
  this.withdrawpolicy.assertCanWithdraw(report.status);

  /**
   * 3️⃣ State transition (DB is authority)
   * - Atomic update
   */
  await this.repo.markWithdrawn(report.id);

  /**
   * 4️⃣ Audit log (side-effect, after DB commit)
   * - Must NOT affect main flow
   * - Fail-safe
   */
  try {
    await this.audit.reportWithdrawn({
      userId: reporterId,
      email: reporterEmail,
      reportId: report.id,
    });
  } catch {
    // 🔕 production-safe: audit failure must not break user action
  }
}

}
