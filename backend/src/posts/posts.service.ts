// backend/src/posts/posts.service.ts
import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCreatePolicy } from './policy/post-create.policy';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PostFeedMapper } from './mappers/post-feed.mapper';
import { PostVisibilityService } from './services/post-visibility.service';
import { PostCacheService } from './cache/post-cache.service';
import { PostDetailDto } from './dto/post-detail.dto';
import { PostDeletePolicy } from './policy/post-delete.policy';
import { PostUpdatePolicy } from './policy/post-update.policy';
import { PostMediaPolicy } from './policy/post-media.policy';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUserPostsQuery } from './dto/get-user-posts.query';
import { PostFeedItemDto } from './dto/post-feed-item.dto';
import { parseHashtags } from './utils/parse-hashtags.util';
import { PostLikePolicy } from './policy/post-like.policy';
import { PostLikeResponseDto } from './dto/post-like-response.dto';
import { PostLikedEvent } from './events/post-liked.event';
import { PostUnlikePolicy } from './policy/post-unlike.policy';
import { PostUnlikeResponseDto } from './dto/post-unlike-response.dto';
import { PostLikeDto } from './dto/post-like.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private readonly audit: PostAudit,
    private readonly postCreatedEvent: PostCreatedEvent,
    private readonly visibility: PostVisibilityService,
    private readonly cache: PostCacheService,
    private readonly prisma: PrismaService,
    private readonly policy: PostLikePolicy,
    private readonly postLikedEvent: PostLikedEvent,
    private readonly unlikePolicy: PostUnlikePolicy,
    private readonly postslikes: PostsRepository,
  ) {}

 async createPost(params: {
  authorId: string;
  dto?: CreatePostDto;
  content?: string;
 }) {
  const { authorId } = params;

  const content =
    params.dto?.content ??
    params.content ??
    '';

  const mediaIds =
    params.dto?.mediaIds ?? [];

  PostCreatePolicy.assertCanCreatePost();

  PostCreatePolicy.assertValid({
    content,
    mediaCount: mediaIds.length,
  });

  if (mediaIds.length > 0) {
    const mediaList = await this.prisma.media.findMany({
      where: {
        id: { in: mediaIds },
      },
      select: {
        id: true,
        ownerUserId: true,
      },
    });

    if (mediaList.length !== mediaIds.length) {
      throw new BadRequestException(
        'Some media not found',
      );
    }

    for (const media of mediaList) {
      PostMediaPolicy.assertOwnership({
        actorUserId: authorId,
        ownerUserId: media.ownerUserId,
      });
    }
  }

  const post = await this.prisma.$transaction(
    async (tx) => {
      const createdPost = await tx.post.create({
        data: {
          authorId,
          content,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      if (mediaIds.length > 0) {
        await tx.postMedia.createMany({
          data: mediaIds.map((mediaId) => ({
            postId: createdPost.id,
            mediaId,
          })),
          skipDuplicates: true,
        });
      }

      /**
       * ===============================
       * Hashtag Processing (FAIL-SOFT)
       * ===============================
       */
      try {
        const tags = parseHashtags(content);

        if (tags.length > 0) {
          // upsert tags
          const tagRows = await Promise.all(
            tags.map((name) =>
              tx.tag.upsert({
                where: { name },
                update: {},
                create: { name },
                select: { id: true },
              }),
            ),
          );

          // link post ↔ tags
          await tx.postTag.createMany({
            data: tagRows.map((tag) => ({
              postId: createdPost.id,
              tagId: tag.id,
            })),
            skipDuplicates: true,
          });
        }
      } catch {

      }

      return createdPost;
    },
  );

  this.audit.logPostCreated({
    postId: post.id,
    authorId,
  });

  this.postCreatedEvent.emit({
    id: post.id,
    authorId,
    createdAt: post.createdAt,
    mediaIds,
  });

  return {
    id: post.id,
    createdAt: post.createdAt,
  };

 }

 
async getPublicFeed(params: {
  viewerUserId: string | null;
  limit: number;
  cursor?: string;

  /**
   * 🔥 OPTIONAL
   * - 'video' = ใช้สำหรับ right video feed (TikTok-style)
   * - undefined = feed ปกติ (text / image / video ปนกัน)
   */
  mediaType?: 'video';
}) {
  const {
    viewerUserId,
    limit,
    cursor,
    mediaType,
  } = params;

  const rows = await this.repo.findPublicFeed({
    limit,
    cursor,
    viewerUserId,

    // ✅ pass-through แบบ fail-safe
    mediaType,
  });

  const items = rows.map((post) =>
    PostFeedMapper.toDto(post, viewerUserId),
  );

  const nextCursor =
    items.length === limit
      ? items[items.length - 1].id
      : null;

  return {
    items,
    nextCursor,
  };
}


 async getPostDetail(params: {
  postId: string;
  viewer: { userId: string; jti: string } | null;
}): Promise<PostDetailDto | null> {
  const { postId, viewer } = params;

  // 1) Public cache
  if (!viewer) {
    const cached = await this.cache.get(postId);
    if (cached) return cached;
  }

  // 2) Load post
  const post = await this.repo.findPostById(postId);
  if (!post) return null;

  // 3) Visibility
  const canView = await this.visibility.canViewPost({
    post,
    viewer,
  });
  if (!canView) return null;

  // 4) Map DTO (✅ FIX: pass viewerUserId)
  const dto = PostDetailDto.from(
    post,
    viewer?.userId,
  );

  // ⛔️ logic เดิม (ไม่แตะ)
  dto.canDelete =
    !!viewer &&
    post.isDeleted === false &&
    viewer.userId === post.author.id;

  // 5) Cache
  const isPublicPost =
    post.visibility === 'PUBLIC' &&
    post.isDeleted === false &&
    post.isHidden === false;

  if (isPublicPost && !viewer) {
    await this.cache.set(postId, dto);
  }

  return dto;
}


async deletePost(params: { postId: string; actorUserId: string }) {
  const { postId, actorUserId } = params;

  const post = await this.repo.findById(postId);
  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  PostDeletePolicy.assertCanDelete({
    actorUserId,
    ownerUserId: post.authorId,
  });

  // ✅ 1) mark media.deletedAt
  await this.prisma.media.updateMany({
    where: {
      posts: {
        some: { postId },
      },
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
      cleanupAt: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  await this.repo.softDelete(postId);

  await this.audit.logDeleted({
    postId,
    actorUserId,
  });
}


  async updatePost(params: {
  postId: string;
  actorUserId: string;
  content: string;
 }) {
  const { postId, actorUserId, content } = params;

  const post = await this.repo.findById(postId);
  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  PostUpdatePolicy.assertCanUpdate({
    actorUserId,
    ownerUserId: post.authorId,
  });

  const updated = await this.repo.updateContent({
    postId,
    content,
  });

  await this.audit.logUpdated({
    postId,
    actorUserId,
  });

  await this.cache.invalidate(postId);

  return {
    id: updated.id,
    content: updated.content,
    editedAt: updated.editedAt,
  };
 }
 

 async getUserPostFeed(params: {
  targetUserId: string;
  query: GetUserPostsQuery;
  viewer: { userId: string } | null; // ✅ เพิ่ม viewer
 }) {
  const { targetUserId, query, viewer } = params;

  // ✅ FIX 1: ส่ง object ให้ resolveUserPostVisibility
  const visibilityScope =
    await this.visibility.resolveUserPostVisibility({
      targetUserId,
      viewer,
    });

  if (!visibilityScope.canView) {
    return { items: [], nextCursor: null };
  }

  const rows = await this.repo.findUserPosts({
    userId: targetUserId,
    limit: query.limit,
    cursor: query.cursor,
    scope: visibilityScope.scope,
  });

  // ✅ FIX 2: ส่ง viewerUserId ให้ mapper
  const items = rows.map((row) =>
    PostFeedMapper.toDto(row, viewer?.userId ?? null),
  );

  const nextCursor =
    rows.length === query.limit
      ? rows[rows.length - 1].id
      : null;

  return {
    items,
    nextCursor,
  };
 }

 async getPostsByTag(params: {
    tag: string;
    viewerUserId: string | null;
    cursor?: string;
    limit: number;
  }): Promise<{
    items: PostFeedItemDto[];
    nextCursor: string | null;
  }> {
    const rows = await this.repo.findPostsByTag({
      tag: params.tag,
      cursor: params.cursor,
      limit: params.limit,
    });

    const items = rows.map((row) =>
      PostFeedMapper.toDto(row, params.viewerUserId),
    );

    const nextCursor =
      rows.length === params.limit
        ? rows[rows.length - 1].id
        : null;

    return { items, nextCursor };
  }
  

  async toggleLike(params: {
    postId: string;
    userId: string;
  }): Promise<PostLikeResponseDto> {
    const { postId, userId } = params;

    const post = await this.repo.findPostForLike(postId);
    this.policy.assertCanLike(post);

    const result = await this.repo.toggleLike({
      postId,
      userId,
    });

    this.postLikedEvent.emit({
      postId,
      userId,
      liked: result.liked,
    });

    return result;
  }

  async unlikePost(params: {
    postId: string;
    userId: string;
  }): Promise<PostUnlikeResponseDto> {
    const { postId, userId } = params;

    const post = await this.repo.findPostForLike(postId);
    this.unlikePolicy.assertCanUnlike(post);

    // idempotent: unlike ซ้ำไม่ error
    return this.repo.unlike({
      postId,
      userId,
    });
  }

  async getLikes(params: {
    postId: string;
    viewerUserId: string;
    cursor?: string;
    limit: number;
  }): Promise<{
    items: PostLikeDto[];
    nextCursor: string | null;
  }> {
    const { postId, cursor, limit } = params;

    const exists = await this.postslikes.existsPost(postId);
    if (!exists) {
      throw new NotFoundException('Post not found');
    }

    const { rows, nextCursor } =
      await this.repo.findLikesByPostId({
        postId,
        cursor,
        limit,
      });

    return {
      items: rows.map((row) => ({
        userId: row.user.id,
        displayName: row.user.displayName ?? null,
        avatarUrl: row.user.avatarUrl ?? null,
        likedAt: row.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }
}
