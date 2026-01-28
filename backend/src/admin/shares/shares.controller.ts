//backend/src/admin/shares/moderation-shares.controller.ts

import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

import { SharesService } from './shares.service';
import { DisableShareDto } from './dto/disable-share.dto';

@Controller('moderation/shares')
export class SharesController {
  constructor(
    private readonly service: SharesService,
  ) {}

  /**
   * POST /moderation/shares/:id/disable
   * Admin moderation action
   */
  @Post(':id/disable')
  @HttpCode(HttpStatus.OK)
  @RateLimit('adminDisableShare')
  @UseGuards(AccessTokenCookieAuthGuard, AdminRoleGuard)
  async disable(
    @Param('id') shareId: string,
    @Body() dto: DisableShareDto,
    @Req() req: Request,
  ) {
    const admin = req.user as { userId: string; jti: string };

    return this.service.disableShare({
      shareId,
      adminUserId: admin.userId,
      reason: dto.reason,
    });
  }
}
