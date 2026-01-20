// backend/src/admin/moderation/follows/moderation-follows.controller.ts

import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ModerationFollowsService } from './moderation-follows.service';
import { ForceRemoveFollowDto } from './dto/force-remove-follow.dto';
import { AccessTokenCookieAuthGuard } from '../../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../../guards/admin-role.guard';

@Controller('api/moderation/follows')
@UseGuards(AccessTokenCookieAuthGuard, AdminRoleGuard)
export class ModerationFollowsController {
  constructor(
    private readonly service: ModerationFollowsService,
  ) {}

  // POST /api/moderation/follows/:id/force-remove
  @Post(':id/force-remove')
  @HttpCode(204)
  async forceRemoveFollow(
    @Param('id') followId: string,
    @Body() dto: ForceRemoveFollowDto,
    @Req()
    req: Request & { user: { userId: string; jti: string } },
  ) {
    await this.service.forceRemove({
      adminId: req.user.userId,
      followId,
      reason: dto.reason,
      note: dto.note,
    });
  }
}

