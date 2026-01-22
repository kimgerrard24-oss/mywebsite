// backend/src/admin/moderation/admin-post-moderation.controller.ts

import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AdminModerationService } from './admin-moderation.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { OverridePostVisibilityDto } from './dto/override-post-visibility.dto';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@Controller('admin/moderation/posts')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminPostModerationController {
  constructor(
    private readonly service: AdminModerationService,
  ) {}

  /**
   * POST /admin/moderation/posts/:id/override-visibility
   */
  @Post(':id/override-visibility')
  async overridePostVisibility(
    @CurrentUser() admin: SessionUser,
    @Param('id') postId: string,
    @Body() dto: OverridePostVisibilityDto,
  ) {
    const actionType =
      dto.visibility === 'PUBLIC'
        ? ModerationActionType.POST_FORCE_PUBLIC
        : ModerationActionType.POST_FORCE_PRIVATE;

    await this.service.createAction(admin.userId, {
      actionType,
      targetType: ModerationTargetType.POST,
      targetId: postId,
      reason: dto.reason ?? 'Admin override visibility',
    });

    return {
      success: true,
      postId,
      effectiveVisibility: dto.visibility,
    };
  }
}
