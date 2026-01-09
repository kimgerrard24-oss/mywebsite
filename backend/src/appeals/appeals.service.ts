// backend/src/appeals/appeals.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppealsRepository } from './appeals.repository';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealStatus } from '@prisma/client';

@Injectable()
export class AppealsService {
  constructor(
    private readonly repo: AppealsRepository,
  ) {}

  async createAppeal(
    userId: string,
    dto: CreateAppealDto,
    context?: {
      ip?: string;
      userAgent?: string;
    },
  ) {
    // 1) ownership
    const isOwner = await this.repo.isOwnerOfTarget(
      userId,
      dto.targetType,
      dto.targetId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You are not the owner of this target',
      );
    }

    // 2) must be moderated before
    const hasModeration =
      await this.repo.hasModerationAction(
        dto.targetType,
        dto.targetId,
      );

    if (!hasModeration) {
      throw new BadRequestException(
        'Target has no moderation action to appeal',
      );
    }

    // 3) duplicate check
    const existing =
      await this.repo.findExistingAppeal(
        userId,
        dto.targetType,
        dto.targetId,
      );

    if (existing) {
      throw new BadRequestException(
        'Appeal already exists for this target',
      );
    }

    // 4) create appeal
    const appeal = await this.repo.createAppeal({
      userId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      detail: dto.detail,
    });

    // 5) audit log (user action)
    await this.repo.createAuditLog({
      userId,
      action: 'USER_CREATE_APPEAL',
      success: true,
      targetId: appeal.id,
      metadata: {
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
      ip: context?.ip,
      userAgent: context?.userAgent,
    });

    return {
      id: appeal.id,
      status: appeal.status,
      createdAt: appeal.createdAt,
    };
  }

   async getMyAppeals(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }) {
    const rows: Array<{
  id: string;
  targetType: string;
  targetId: string;
  status: string;
  reason: string;
  createdAt: Date;
  resolvedAt: Date | null;
  resolutionNote: string | null;
  }> = await this.repo.findMyAppeals(params);

    let nextCursor: string | null = null;

    if (rows.length > params.limit) {
      const next = rows.pop();
      nextCursor = next!.id;
    }

    return {
      items: rows.map((r) => ({
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        status: r.status,
        reason: r.reason,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
        resolutionNote: r.resolutionNote,
      })),
      nextCursor,
    };
  }

  async getMyAppealById(params: {
    userId: string;
    appealId: string;
  }) {
    const row =
      await this.repo.findMyAppealById(params);

    if (!row) {
      // ❗ ไม่แยกว่า not owner หรือ not exist
      throw new NotFoundException(
        'Appeal not found',
      );
    }

    return {
      id: row.id,
      targetType: row.targetType,
      targetId: row.targetId,
      status: row.status,
      reason: row.reason,
      detail: row.detail,
      createdAt: row.createdAt,
      resolvedAt: row.resolvedAt,
      resolutionNote: row.resolutionNote,
    };
  }

  async withdrawMyAppeal(params: {
    userId: string;
    appealId: string;
  }) {
    const row = await this.repo.findByIdAndUser({
      appealId: params.appealId,
      userId: params.userId,
    });

    if (!row) {
      // ❗ไม่บอกว่าไม่ใช่ของคุณหรือไม่มีจริง
      throw new NotFoundException(
        'Appeal not found',
      );
    }

    if (row.status !== AppealStatus.PENDING) {
      throw new BadRequestException(
        'Appeal cannot be withdrawn',
      );
    }

    const updated =
      await this.repo.withdrawAppeal({
        appealId: params.appealId,
      });

    return {
      success: true,
      id: updated.id,
      status: updated.status,
      withdrawnAt: updated.withdrawnAt,
    };
  }
}
