// backend/src/reposts/reposts.controller.ts

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Query,
  Get,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RepostsService } from './reposts.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { DeleteRepostParamsDto } from './dto/delete-repost.params.dto';
import { ParsePostIdPipe } from '../posts/pipes/parse-post-id.pipe';
import { GetPostRepostsQueryDto } from './dto/get-post-reposts.query.dto';

@Controller('reposts')
export class RepostsController {
  constructor(
    private readonly repostsService: RepostsService,
  ) {}

  /**
   * POST /reposts
   * Create repost (feed activity)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit('repostCreate')
  @UseGuards(AccessTokenCookieAuthGuard)
  async createRepost(
    @Body() dto: CreateRepostDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.repostsService.createRepost({
      actorUserId: actor.userId,
      postId: dto.postId,
    });
  }

  /**
   * DELETE /reposts/:postId
   * Undo repost
   */
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RateLimit('repostDelete')
  @UseGuards(AccessTokenCookieAuthGuard)
  async deleteRepost(
    @Param() params: DeleteRepostParamsDto,
    @Req() req: Request,
  ): Promise<void> {
    const actor = req.user as { userId: string; jti: string };

    await this.repostsService.deleteRepost({
      actorUserId: actor.userId,
      postId: params.postId,
    });
  }

   /**
   * GET /posts/:id/reposts
   */
  @Get(':id/reposts')
  @RateLimit('repostList')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getPostReposts(
    @Param('id', ParsePostIdPipe) postId: string,
    @Query() query: GetPostRepostsQueryDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const limit =
      typeof query.limit === 'string'
        ? Math.min(Math.max(Number(query.limit) || 20, 1), 50)
        : 20;

    return this.repostsService.getPostReposts({
      postId,
      viewerUserId: req.user.userId,
      limit,
      cursor: query.cursor,
    });
  }
}
