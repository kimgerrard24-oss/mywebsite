// backend/src/moderation/moderationcontroller/moderation-users.controller.ts

import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../../admin/guards/admin-role.guard';
import { AdminUpdateIdentityService } from '../../admin/admin-update-identity.service';
import { AdminUpdateIdentityDto } from '../../admin/dto/admin-update-identity.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('moderation/users')
export class ModerationUsersController {
  constructor(
    private readonly service: AdminUpdateIdentityService,
  ) {}

  @UseGuards(
    AccessTokenCookieAuthGuard,
    AdminRoleGuard,
  )
  @Post(':id/update-identity')
  @RateLimit('adminUpdateIdentity')
  @HttpCode(HttpStatus.OK)
  async updateIdentity(
    @Param('id') targetUserId: string,
    @CurrentUser() admin: SessionUser,   // ✅ from Redis session
    @Req() req: Request,                 // ✅ for IP audit
    @Body() dto: AdminUpdateIdentityDto,
  ) {
    return this.service.updateIdentity({
      adminId: admin.userId,
      targetUserId,
      payload: dto,
      ip:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        undefined,
    });
  }
}
