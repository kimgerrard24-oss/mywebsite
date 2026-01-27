// backend/src/follows/follow-request/follow-requests.controller.ts

import {
  Controller,
  Post,
  Param,
  Delete,
  Get,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { FollowRequestsService } from './follow-requests.service';
import { CreateFollowRequestParams } from './dto/create-follow-request.params';
import { CancelFollowRequestParams } from './dto/cancel-follow-request.params';
import { GetIncomingFollowRequestsQuery } from './dto/get-incoming-follow-requests.query';
import { ApproveFollowRequestParams } from './dto/approve-follow-request.params';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('follows/requests')
export class FollowRequestsController {
  constructor(
    private readonly service: FollowRequestsService,
  ) {}

  @Post(':targetUserId')
  @RateLimit('followRequestCreate')
  @HttpCode(204)
  @UseGuards(AccessTokenCookieAuthGuard)
  async createRequest(
    @Param() params: CreateFollowRequestParams,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as { userId: string; jti: string };

    await this.service.createRequest({
      requesterId: actor.userId,
      targetUserId: params.targetUserId,
      jti: actor.jti,
    });
  }

  // ================================
  // DELETE /api/follows/requests/:targetUserId
  // ================================
  @Delete(':targetUserId')
  @RateLimit('followRequestCancel')
  @HttpCode(204)
  @UseGuards(AccessTokenCookieAuthGuard)
  async cancelRequest(
    @Param() params: CancelFollowRequestParams,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as { userId: string; jti: string };

    await this.service.cancelRequest({
      requesterId: actor.userId,
      targetUserId: params.targetUserId,
      jti: actor.jti,
    });
  }

   // ============================================
  // GET /api/follows/requests/incoming
  // ============================================
  @Get('incoming')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getIncoming(
    @Req() req: Request,
    @Query() query: GetIncomingFollowRequestsQuery,
  ) {
    const actor = req.user as { userId: string };

    return this.service.getIncomingRequests({
      targetUserId: actor.userId,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Post(':requestId/approve')
  @RateLimit('followRequestApprove')
  @HttpCode(204)
  @UseGuards(AccessTokenCookieAuthGuard)
  async approve(
    @Param() params: ApproveFollowRequestParams,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as {
      userId: string;
      jti: string;
    };

    await this.service.approveRequest({
      requestId: params.requestId,
      actorUserId: actor.userId,
      jti: actor.jti,
    });
  }

  // ================================
  // Reject follow request
  // POST /api/follows/requests/:requestId/reject
  // ================================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('followRequestReject')
  @Post(':requestId/reject')
  @HttpCode(204)
  async reject(
    @Param('requestId') requestId: string,
    @Req() req: Request & {
      user: { userId: string; jti: string };
    },
  ) {
    await this.service.rejectRequest({
      requestId,
      actorUserId: req.user.userId,
      jti: req.user.jti,
    });
  }
}
