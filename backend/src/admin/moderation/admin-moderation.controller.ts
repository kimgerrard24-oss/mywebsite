// backend/src/admin/moderation/admin-moderation.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AdminModerationService } from './admin-moderation.service';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';

@Controller('admin/moderation/actions')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminModerationController {
  constructor(
    private readonly service: AdminModerationService,
  ) {}

  /**
   * POST /admin/moderation/actions
   * Create admin moderation action (auditable)
   */
  @Post()
  async createAction(
    @CurrentUser() admin: SessionUser,
    @Body() dto: CreateModerationActionDto,
  ): Promise<ModerationActionDto> {
    return this.service.createAction(
      admin.userId,
      dto,
    );
  }

}
