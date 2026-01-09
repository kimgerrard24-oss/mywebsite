// backend/src/admin/appeals/admin-appeals.controller.ts


import {
  Controller,
  Get,
  Body,
  Query,
  Post,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminAppealsService } from './admin-appeals.service';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';

import { AdminGetAppealsQueryDto } from './dto/admin-get-appeals.query.dto';
import { AdminGetAppealParamsDto } from './dto/admin-get-appeal.params.dto';
import { AdminResolveAppealDto } from './dto/admin-resolve-appeal.dto';
import { AdminResolveAppealParamsDto } from './dto/admin-resolve-appeal.params.dto';
import { AdminAppealStatsQueryDto } from './dto/admin-appeal-stats.query.dto';

import type { Request } from 'express';

type AuthedRequest = Request & {
  user: {
    userId: string;
    jti: string;
  };
};

@Controller('admin/appeals')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminAppealsController {
  constructor(
    private readonly service: AdminAppealsService,
  ) {}

  /**
   * GET /admin/appeals
   */
  @Get()
  async getAppeals(
    @Query() query: AdminGetAppealsQueryDto,
  ) {
    return this.service.getAdminAppeals({
      status: query.status,
      targetType: query.targetType,
      cursor: query.cursor,
      limit: query.limit ?? 20,
    });
  }

  /**
   * GET /admin/appeals/:id
   */
  @Get(':id')
  async getAppealById(
    @Param() params: AdminGetAppealParamsDto,
  ) {
    return this.service.getAdminAppealById(
      params.id,
    );
  }

  /**
   * POST /admin/appeals/:id/resolve
   */
  @Post(':id/resolve')
  async resolveAppeal(
    @Req() req: AuthedRequest,
    @Param() params: AdminResolveAppealParamsDto,
    @Body() dto: AdminResolveAppealDto,
  ) {
    return this.service.resolveAppeal(
      req.user.userId, // ✅ admin id from session
      {
        appealId: params.id,
        decision: dto.decision,
        resolutionNote: dto.resolutionNote,
      },
    );
  }

  /**
   * GET /admin/appeals/stats
   */
  @Get('stats')
  async getStats(
    @Query() query: AdminAppealStatsQueryDto,
  ) {
    return this.service.getStats({
      range: query.range ?? '7d',
    });
  }
}

