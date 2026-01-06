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
  dto: CreateReportDto;
}) {
  const { reporterId, dto } = params;

  /**
   * 1️⃣ Prevent duplicate report
   * (DB + unique constraint is the final authority,
   *  this is an early guard)
   */
  const duplicate = await this.repo.findDuplicate({
    reporterId,
    targetType: dto.targetType,
    targetId: dto.targetId,
  });

  if (duplicate) {
    throw new ConflictException(
      'You have already reported this content',
    );
  }

  /**
   * 2️⃣ Resolve target owner (authority lookup)
   * - POST         → post.authorId
   * - COMMENT      → comment.authorId
   * - USER         → user.id
   * - CHAT_MESSAGE → chatMessage.senderId
   *
   * If target does not exist → NotFoundException
   */
  const targetOwnerId =
    await this.repo.findTargetOwnerId({
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

  /**
   * 3️⃣ Enforce business policy (backend authority)
   * - cannot report own content
   */
  this.policy.assertCanReport({
    reporterId,
    targetOwnerId,
  });

  /**
   * 4️⃣ Create report (DB is source of truth)
   */
  await this.repo.create({
    reporterId,
    targetType: dto.targetType,
    targetId: dto.targetId,
    reason: dto.reason,
    description: dto.description,
  });

  /**
   * 5️⃣ Audit log (side-effect)
   * - must NOT affect main flow
   */
  try {
    await this.audit.reportCreated({
      userId: reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });
  } catch {
    // 🔕 production-safe: ignore audit failure
  }
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
    reportId: string;
  }) {
    const { reporterId, reportId } = params;

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
     */
    this.withdrawpolicy.assertCanWithdraw(
      report.status,
    );

    /**
     * 3️⃣ State transition (DB is authority)
     */
    await this.repo.markWithdrawn(report.id);

    /**
     * 4️⃣ Audit log (side-effect)
     * - Must NOT affect main flow
     */
    try {
      await this.audit.reportWithdrawn({
        userId: reporterId,
        reportId: report.id,
      });
    } catch {
      // 🔕 production-safe
    }
  }
}
