// backend/src/admin/appeals/dto/admin-appeal-item.dto.ts

import { Expose } from 'class-transformer';
import {
  AppealStatus,
  AppealTargetType,
} from '@prisma/client';

/**
 * Admin list / detail response item
 * Used only for OUTPUT (never for input)
 */
export class AdminAppealItemDto {
  @Expose()
  readonly id!: string;

  @Expose()
  readonly userId!: string;

  @Expose()
  readonly targetType!: AppealTargetType;

  @Expose()
  readonly targetId!: string;

  @Expose()
  readonly status!: AppealStatus;

  @Expose()
  readonly reason!: string;

  @Expose()
  readonly createdAt!: Date;

  @Expose()
  readonly resolvedAt!: Date | null;
}
