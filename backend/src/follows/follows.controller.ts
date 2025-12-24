// backend/src/follows/follows.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { FollowsService } from './follows.service';
import { FollowUserParams } from './dto/follow-user.params';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { UnfollowUserParams } from './dto/unfollow-user.params';
import { GetFollowersParams } from './dto/get-followers.params';
import { GetFollowersQuery } from './dto/get-followers.query';

@Controller('follow')
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @Post(':userId')
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

   @Delete('unfollow/:userId')
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

  @Get(':userId')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getFollowers(
    @Param() params: GetFollowersParams,
    @Query() query: GetFollowersQuery,
  ) {
    return this.service.getFollowers({
      userId: params.userId,
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}
