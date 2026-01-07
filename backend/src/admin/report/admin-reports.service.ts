// backend/src/admin/report/admin-reports.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminReportsRepository } from './admin-reports.repository';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports.query.dto';
import { AdminReportListDto } from './dto/admin-report-list.dto';
import { AdminReportPolicy } from './policy/admin-report.policy';
import { AdminReportDetailDto } from './dto/admin-report-detail.dto';
import { AdminReportStatsDto } from './dto/admin-report-stats.dto';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly repo: AdminReportsRepository,
  ) {}

  async getReports(
    query: GetAdminReportsQueryDto,
  ): Promise<AdminReportListDto> {
    AdminReportPolicy.assertValidQuery(query);

    const { items, total } =
      await this.repo.findReports(query);

    return AdminReportListDto.from({
      items,
      total,
      page: query.page,
      limit: query.limit,
    });
  }

  /**
   * GET /admin/reports/:id
   * - Read-only admin evidence view
   * - Backend is authority
   * - Includes target snapshot (evidence at time of review)
   */
async getReportById(
  reportId: string,
): Promise<AdminReportDetailDto> {
  const report =
    await this.repo.findReportById(reportId);

  if (!report) {
    throw new NotFoundException(
      'Report not found',
    );
  }

  // 🔒 Business rule: admin can read only allowed reports
  AdminReportPolicy.assertReadable(report);

  /**
   * ==============================
   * Target snapshot (backend authority)
   * ==============================
   *
   * Purpose:
   * - Admin must see real content, not only targetId
   * - Snapshot is fetched fresh from DB (not from client)
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
          stats: {
            commentCount:
              post._count?.comments ?? 0,
            likeCount:
              post._count?.likes ?? 0,
          },
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

  /**
   * IMPORTANT:
   * - Do NOT trust frontend for content
   * - Attach snapshot here, DTO will shape response
   */
  return AdminReportDetailDto.from({
    ...report,
    targetSnapshot,
  });
}


  /**
   * GET /admin/reports/stats
   * - Admin-only statistics
   */
  async getStats(): Promise<AdminReportStatsDto> {
    const [
      total,
      byStatus,
      byTarget,
      last24h,
      last7d,
    ] = await Promise.all([
      this.repo.countAll(),
      this.repo.countByStatus(),
      this.repo.countByTargetType(),
      this.repo.countCreatedSince(1),
      this.repo.countCreatedSince(7),
    ]);

    return {
      total,
      byStatus,
      byTargetType: byTarget,
      activity: {
        last24h,
        last7d,
      },
    };
  }
}
