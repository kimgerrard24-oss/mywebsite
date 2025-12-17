// backend/src/posts/posts.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AccessTokenCookieAuthGuard)
  async createPost(
    @Body() dto: CreatePostDto,
    @Req() req: Request,
  ) {
    /**
     * req.user ถูก attach โดย ValidateSessionService
     * { userId, jti }
     */
    const actor = req.user as { userId: string; jti: string };

    return this.postsService.createPost({
      authorId: actor.userId,
      content: dto.content,
    });
  }

   @Get()
  async getFeed(
    @Query() query: GetPostsQueryDto,
    @Req() req: Request,
  ) {
    const viewerUserId =
      typeof (req as any).user?.userId === 'string'
        ? (req as any).user.userId
        : null;

    return this.postsService.getPublicFeed({
      viewerUserId,
      limit: query.limit,
      cursor: query.cursor,
    });
  }
}
