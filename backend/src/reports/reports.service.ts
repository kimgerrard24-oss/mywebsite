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

    const duplicate = await this.repo.findDuplicate({
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

    if (duplicate) {
  try {
    await this.audit.reportDuplicateAttempt({
      userId: reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });
  } catch {}

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

    /**
     * ==============================
     * Target snapshot (backend authority)
     * ==============================
     *
     * Purpose:
     * - User must see what they reported (not only targetId)
     * - Snapshot is fetched fresh from DB
     * - If target already deleted → snapshot may be null
     */

    let targetSnapshot: any = undefined;

    switch (report.targetType) {
      case 'POST': {
        const post =
          await this.repo.findPostSnapshotById(
            report.targetId,
          );

        if (post) {
          targetSnapshot = {
            type: 'POST',
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            isHidden: post.isHidden === true,
            isDeleted: post.isDeleted === true,
            deletedSource:
              post.deletedSource ?? null,
            author: post.author,
          };
        }
        break;
      }

      case 'COMMENT': {
        const comment =
          await this.repo.findCommentSnapshotById(
            report.targetId,
          );

        if (comment) {
          targetSnapshot = {
            type: 'COMMENT',
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            isHidden: comment.isHidden === true,
            isDeleted: comment.isDeleted === true,
            author: comment.author,
            post: {
              id: comment.post.id,
            },
          };
        }
        break;
      }

      case 'USER': {
        const user =
          await this.repo.findUserSnapshotById(
            report.targetId,
          );

        if (user) {
          targetSnapshot = {
            type: 'USER',
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            createdAt: user.createdAt,
            isDisabled: user.isDisabled === true,
          };
        }
        break;
      }

      case 'CHAT_MESSAGE': {
        const message =
          await this.repo.findChatMessageSnapshotById(
            report.targetId,
          );

        if (message) {
          targetSnapshot = {
            type: 'CHAT_MESSAGE',
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isDeleted: message.isDeleted === true,
            sender: message.sender,
          };
        }
        break;
      }

      default:
        targetSnapshot = undefined;
    }
     // BEFORE return
try {
  await this.audit.reportViewed({
    userId: params.reporterId,
    reportId: report.id,
  });
} catch {
  // must not affect response
}

    return ReportDetailDto.fromEntity({
      ...report,
      targetSnapshot,
    });
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

