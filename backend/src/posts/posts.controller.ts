// backend/src/posts/posts.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Put,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
  NotFoundException, 
  Patch,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostLikeResponseDto } from './dto/post-like-response.dto';
import { PostUnlikeResponseDto } from './dto/post-unlike-response.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { UpdatePostVisibilityDto } from './dto/update-post-visibility.dto';
import { PostVisibilityRulesDto } from './dto/post-visibility-rules.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { AcceptPostTagParamsDto } from './dto/accept-post-tag.params.dto';
import { RejectPostTagParamsDto } from './dto/reject-post-tag.params.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(201)
  @RateLimit('postCreate')
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
  @Query() query: GetPostsQueryDto & { mediaType?: string },
  @Req() req: Request,
 ) {
  let viewerUserId: string | null = null;

  const user = req.user as
    | { userId: string; jti: string }
    | undefined;

  if (user && typeof user.userId === 'string') {
    viewerUserId = user.userId;
  }

  const limit =
    typeof query.limit === 'number' && Number.isFinite(query.limit)
      ? Math.min(query.limit, 50)
      : 20;

  const mediaType =
    query.mediaType === 'video' ? 'video' : undefined;

  return this.postsService.getPublicFeed({
    viewerUserId,
    limit,
    cursor: query.cursor ?? undefined,

    mediaType,
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
  @RateLimit('postDelete')
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
 @RateLimit('postUpdate')
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
 
   // =================================================
  // 🔐 UPDATE POST VISIBILITY (NEW)
  // PATCH /api/posts/:id/visibility
  // =================================================
  @Patch(':id/visibility')
  @RateLimit('postUpdateVisibility')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenCookieAuthGuard)
  async updatePostVisibility(
    @Param('id', ParsePostIdPipe) postId: string,
    @Body() dto: UpdatePostVisibilityDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.postsService.updatePostVisibility({
      postId,
      actorUserId: actor.userId,
      dto,
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
    viewer: req.user ?? null, 
  });

 }

 @Get('tag/:tag')
  @UseGuards(OptionalAuthGuard)
  async getPostsByTag(
    @Param('tag') tag: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: { userId: string } | null,
  ) {
    return this.postsService.getPostsByTag({
      tag,
      viewerUserId: user?.userId ?? null,
      cursor,
      limit: limit ? Math.min(Number(limit), 50) : 20,
    });
  }
  
 @Post(':id/like')
 @RateLimit('postLike')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenCookieAuthGuard)
  async likePost(
    @Param('id') postId: string,
    @Req() req: Request,
  ): Promise<PostLikeResponseDto> {
    const userId = req.user!.userId;

    return this.postsService.toggleLike({
      postId,
      userId,
    });
  }
  

  @Delete(':id/unlike')
  @RateLimit('postLike')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenCookieAuthGuard)
  async unlikePost(
    @Param('id') postId: string,
    @Req() req: Request,
  ): Promise<PostUnlikeResponseDto> {
    const userId = req.user!.userId;

    return this.postsService.unlikePost({
      postId,
      userId,
    });
  }

  @Get(':id/likes')
 @UseGuards(AccessTokenCookieAuthGuard)
 async getPostLikes(
  @Param('id') postId: string,
  @Req() req: Request & { user: { userId: string } },
  @Query('cursor') cursor?: string,
  @Query('limit') limit = '20',
 ) {
  return this.postsService.getLikes({
    postId,
    viewerUserId: req.user.userId,
    cursor,
    limit: Math.min(Number(limit) || 20, 50),
  });
 }

 @UseGuards(AccessTokenCookieAuthGuard)
@Get(':id/visibility-rules')
async getPostVisibilityRules(
  @Param('id') postId: string,
  @Req() req: Request,
): Promise<PostVisibilityRulesDto> {
  const user = req.user as {
    userId: string;
    jti: string;
  };

  return this.postsService.getPostVisibilityRules({
    postId,
    actorUserId: user.userId,
  });
}

@Patch(':postId/tags')
@RateLimit('postUpdateTags')
  @UseGuards(AccessTokenCookieAuthGuard)
  async updatePostTag(
    @Param('postId') _postId: string, // not trusted
    @Body() dto: UpdatePostTagsDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string };

    return this.postsService.updateTag({
      actorUserId: actor.userId,
      dto,
    });
  }

   @Delete(':postId/tags/me')
   @RateLimit('postUpdateTags')
  @HttpCode(200)
  @UseGuards(AccessTokenCookieAuthGuard)
  async removeMyTag(
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string };

    return this.postsService.removeMyTag({
      postId,
      actorUserId: actor.userId,
    });
  }

  @Get(':postId/tags')
@UseGuards(OptionalAuthGuard) // ให้ public ดูได้ถ้า visibility ผ่าน
async getPostTags(
  @Param('postId', ParsePostIdPipe) postId: string,
  @Req() req: Request,
) {
  const viewer =
    req.user && typeof req.user === 'object'
      ? { userId: (req.user as any).userId }
      : null;

  return this.postsService.getPostUserTags({
    postId,
    viewerUserId: viewer?.userId ?? null,
  });
}

@Post(':postId/tags/:tagId/accept')
@RateLimit('postTagDecision')
@HttpCode(200)
@UseGuards(AccessTokenCookieAuthGuard)
async acceptPostTag(
  @Param() params: AcceptPostTagParamsDto,
  @Req() req: Request,
) {
  const actor = req.user as { userId: string };

  return this.postsService.acceptPostTag({
    postId: params.postId,
    tagId: params.tagId,
    actorUserId: actor.userId,
  });
}

@Post(':postId/tags/:tagId/reject')
@RateLimit('postTagDecision')
@HttpCode(200)
@UseGuards(AccessTokenCookieAuthGuard)
async rejectPostTag(
  @Param() params: RejectPostTagParamsDto,
  @Req() req: Request,
) {
  const actor = req.user as { userId: string };

  return this.postsService.rejectPostTag({
    postId: params.postId,
    tagId: params.tagId,
    actorUserId: actor.userId,
  });
}


@Post(':postId/tags/hide')
@RateLimit('postTagHide')
@HttpCode(HttpStatus.OK)
@UseGuards(AccessTokenCookieAuthGuard)
async hideTaggedPost(
  @Param('postId', ParsePostIdPipe) postId: string,
  @Req() req: { user: { userId: string } },
) {
  return this.postsService.hideTaggedPost({
    postId,
    actorUserId: req.user.userId,
  });
}



@Post(':postId/tags/unhide')
@RateLimit('postTagUnhide')
@HttpCode(HttpStatus.OK)
@UseGuards(AccessTokenCookieAuthGuard)
async unhideTaggedPost(
  @Param('postId', ParsePostIdPipe) postId: string,
  @Req() req: { user: { userId: string } },
) {
  return this.postsService.unhideTaggedPost({
    postId,
    actorUserId: req.user.userId,
  });
}


@UseGuards(AccessTokenCookieAuthGuard)
@RateLimit('userHiddenTaggedPostsRead')
@Get('me/tagged-posts/hidden')
async getMyHiddenTaggedPosts(
  @CurrentUser() user: { userId: string },
  @Query('limit') limit?: string,
  @Query('cursor') cursor?: string,
) {
  const take =
    typeof limit === 'string'
      ? Math.min(Math.max(Number(limit) || 20, 1), 50)
      : 20;

  return this.postsService.getHiddenTaggedPosts({
    viewerUserId: user.userId,
    limit: take,
    cursor,
  });
}

}