// backend/src/posts/posts.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Put,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
  NotFoundException, 
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { GetPostsQueryDto } from './dto/get-posts.query.dto';
import { ParsePostIdPipe } from './pipes/parse-post-id.pipe';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { DeletePostParamsDto } from './dto/delete-post.params.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetUserPostsQuery } from './dto/get-user-posts.query';

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
   
    const actor = req.user as { userId: string; jti: string };

    const post = await this.postsService.createPost({
      authorId: actor.userId,
      dto, 
    });

    return {
      id: post.id,
      createdAt: post.createdAt,
    };
   }

 @Get()
 @UseGuards(OptionalAuthGuard)
 async getFeed(
  @Query() query: GetPostsQueryDto,
  @Req() req: Request,
 ) {
  // SAFE: extract viewer userId (fail-soft)
  let viewerUserId: string | null = null;

  const user = req.user as
    | { userId: string; jti: string }
    | undefined;

  if (user && typeof user.userId === 'string') {
    viewerUserId = user.userId;
  }

  // SAFE: normalize limit
  const limit =
    typeof query.limit === 'number' && Number.isFinite(query.limit)
      ? Math.min(query.limit, 50)
      : 20;

  return this.postsService.getPublicFeed({
    viewerUserId,
    limit,
    cursor: query.cursor ?? undefined,
  });
 }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getPostById(
    @Param('id', ParsePostIdPipe) postId: string,
    @Req() req: Request,
  ) {
    const viewer =
      req.user && typeof req.user === 'object'
      ? {
        userId: (req.user as any).userId,
        jti: (req.user as any).jti,
      }
      : null;

    const post = await this.postsService.getPostDetail({
      postId,
      viewer,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }



  @Delete(':id')
 @HttpCode(204)
 @UseGuards(AccessTokenCookieAuthGuard)

 async deletePost(
  @Param('id', ParsePostIdPipe) postId: string,
  @Req() req: any,
 ): Promise<void> {
  await this.postsService.deletePost({

    postId,
    actorUserId: req.user.userId,

  });
 }

   @Put(':id')
 @HttpCode(200)
 @UseGuards(AccessTokenCookieAuthGuard)
 async updatePost(
  @Param('id', ParsePostIdPipe) postId: string,
  @Body() dto: UpdatePostDto,
  @Req() req: Request,
 ) {
  const actor = req.user as { userId: string; jti: string };

  return this.postsService.updatePost({
    postId,
    actorUserId: actor.userId,
    content: dto.content,
  });
 }
 

  @UseGuards(AccessTokenCookieAuthGuard)
 @Get('user/:userId')
 async getUserPosts(
  @Param('userId') userId: string,
  @Query() query: GetUserPostsQuery,
  @Req() req: Request & { user?: { userId: string } },
 ) {
  return this.postsService.getUserPostFeed({
    targetUserId: userId,
    query,
    viewer: req.user ?? null, // ✅ FIX
  });

 }
}