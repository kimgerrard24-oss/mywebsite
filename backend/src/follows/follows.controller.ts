// backend/src/follows/follows.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { FollowsService } from './follows.service';
import { FollowUserParams } from './dto/follow-user.params';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { UnfollowUserParams } from './dto/unfollow-user.params';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('follows')
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @Post(':userId')
  @RateLimit('followUser')
  @HttpCode(204)
  @UseGuards(AccessTokenCookieAuthGuard)
  async followUser(
    @Param() params: FollowUserParams,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as { userId: string; jti: string };

    await this.service.follow({
      followerId: actor.userId,
      followingId: params.userId,
    });
  }

  @Delete(':userId')
  @RateLimit('unfollowUser')
  @HttpCode(204)
  @UseGuards(AccessTokenCookieAuthGuard)
  async unfollowUser(
    @Param() params: UnfollowUserParams,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as { userId: string; jti: string };

    await this.service.unfollow({
      followerId: actor.userId,
      followingId: params.userId,
    });
  }
}

