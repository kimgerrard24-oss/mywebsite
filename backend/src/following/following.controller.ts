// backend/src/following/following.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FollowingService } from './following.service';
import { GetFollowingParams } from './dto/get-following.params';
import { GetFollowingQuery } from './dto/get-following.query';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';

@Controller('following')
export class FollowingController {
  constructor(private readonly service: FollowingService) {}

  @Get(':userId')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getFollowing(
    @Param() params: GetFollowingParams,
    @Query() query: GetFollowingQuery,
  ) {
    return this.service.getFollowing({
      userId: params.userId,
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}
