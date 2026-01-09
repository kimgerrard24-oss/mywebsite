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
export class AppealsController {
  constructor(
    private readonly service: AppealsService,
  ) {}

  @Post()
  @UseGuards(AccessTokenCookieAuthGuard)
  async createAppeal(
    @Req() req: Request & {
      user?: { userId: string; jti: string };
    },
    @Body() dto: CreateAppealDto,
  ) {
    const userId = req.user!.userId;

    return this.service.createAppeal(userId, dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get('me')
  async getMyAppeals(
    @Req() req: Request & {
      user: { userId: string; jti: string };
    },
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
  @UseGuards(AccessTokenCookieAuthGuard)
  @Get('me/:id')
  async getMyAppealById(
    @Req() req: AuthedRequest,
    @Param() params: GetMyAppealParamsDto,
  ) {
    const userId = req.user.userId;

    return this.service.getMyAppealById({
      userId,
      appealId: params.id,
    });
  }

   /**
   * POST /appeals/:id/withdraw
   * Owner can withdraw only when status = PENDING
   */
  @UseGuards(AccessTokenCookieAuthGuard)
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
