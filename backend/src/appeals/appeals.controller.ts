// backend/src/appeals/appeals.controller.ts

import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppealsService } from './appeals.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import type { Request } from 'express';
import { GetMyAppealsQueryDto } from './dto/get-my-appeals.query.dto';
import { GetMyAppealParamsDto } from './dto/get-my-appeal.params.dto';
import { WithdrawAppealParamsDto } from './dto/withdraw-appeal.params.dto';

type AuthedRequest = Request & {
  user: {
    userId: string;
    jti: string;
  };
};

@Controller('appeals')
@UseGuards(AccessTokenCookieAuthGuard)
export class AppealsController {
  constructor(
    private readonly service: AppealsService,
  ) {}

  /**
   * POST /appeals
   * Create appeal (service validates eligibility)
   */
  @Post()
  async createAppeal(
    @Req() req: AuthedRequest,
    @Body() dto: CreateAppealDto,
  ) {
    return this.service.createAppeal(
      req.user.userId,
      dto,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }

  /**
   * GET /appeals/me
   */
  @Get('me')
  async getMyAppeals(
    @Req() req: AuthedRequest,
    @Query() query: GetMyAppealsQueryDto,
  ) {
    return this.service.getMyAppeals({
      userId: req.user.userId,
      cursor: query.cursor,
      limit: query.limit ?? 20,
    });
  }

  /**
   * GET /appeals/me/:id
   * Owner-only appeal detail
   */
  @Get('me/:id')
  async getMyAppealById(
    @Req() req: AuthedRequest,
    @Param() params: GetMyAppealParamsDto,
  ) {
    return this.service.getMyAppealById({
      userId: req.user.userId,
      appealId: params.id,
    });
  }

  /**
   * POST /appeals/:id/withdraw
   * Owner can withdraw only when status = PENDING
   */
  @Post(':id/withdraw')
  async withdrawAppeal(
    @Req() req: AuthedRequest,
    @Param() params: WithdrawAppealParamsDto,
  ) {
    return this.service.withdrawMyAppeal({
      userId: req.user.userId,
      appealId: params.id,
    });
  }
}
