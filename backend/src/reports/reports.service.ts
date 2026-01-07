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

    const targetOwnerId =
      await this.repo.findTargetOwnerId({
        targetType: dto.targetType,
        targetId: dto.targetId,
      });

    this.policy.assertCanReport({
      reporterId,
      targetOwnerId,
    });

    await this.repo.create({
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
    });

    try {
      await this.audit.reportCreated({
        userId: reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      });
    } catch {
      // production-safe: ignore audit failure
    }
  }

  async getMyReports(params: {
    reporterId: string;
    cursor: string | null;
    limit: number;
  }) {
    /**
     * Backend authority:
     * - Do not trust raw query limit
     * - Enforce safe minimum for pagination
     */
    const safeLimit =
      typeof params.limit === 'number' &&
      params.limit > 0
        ? params.limit
        : 20;

    const result =
      await this.repo.findMyReports({
        reporterId: params.reporterId,
        cursor: params.cursor,
        limit: safeLimit,
      });

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

    const report = await this.repo.findForWithdraw({
      reportId,
      reporterId,
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    this.withdrawpolicy.assertCanWithdraw(
      report.status,
    );

    await this.repo.markWithdrawn(report.id);

    try {
      await this.audit.reportWithdrawn({
        userId: reporterId,
        reportId: report.id,
      });
    } catch {
      // production-safe
    }
  }
}
