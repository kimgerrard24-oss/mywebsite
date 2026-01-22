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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationMapper } from '../notifications/mapper/notification.mapper';

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
    private readonly notifications: NotificationsService,
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
          visibility: 'PUBLIC',
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

  // 2) Load post (with author)
  const post = await this.repo.findPostById(
    postId,
    viewer?.userId,
  );
  if (!post) return null;

  // =====================================================
  // 🔒 HARD BLOCK GUARD (2-way)
  // - viewer block author
  // - author block viewer
  // - deny BEFORE visibility & mapping
  // =====================================================
  if (viewer?.userId) {
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: viewer.userId,
            blockedId: post.author.id,
          },
          {
            blockerId: post.author.id,
            blockedId: viewer.userId,
          },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) {
      // production behavior:
      // - do not reveal existence
      return null;
    }
  }

  // 3) Visibility (existing logic — KEEP)
  const canView = await this.visibility.canViewPost({
    post,
    viewer,
  });
  if (!canView) return null;

  // 4) Map DTO
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
  viewer: { userId: string } | null;
}) {
  const { targetUserId, query, viewer } = params;

  // =====================================================
  // 🔒 HARD BLOCK GUARD (2-way)
  // - viewer block target
  // - target block viewer
  // - ต้อง deny ตั้งแต่ระดับ service (authority)
  // =====================================================
  if (viewer?.userId) {
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: viewer.userId,
            blockedId: targetUserId,
          },
          {
            blockerId: targetUserId,
            blockedId: viewer.userId,
          },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) {
      // production behavior:
      // - ไม่บอกว่า block
      // - behave เหมือน user ไม่อยู่
      throw new NotFoundException();
    }
  }

  // =====================================================
  // 🔐 Existing visibility logic (KEEP)
  // =====================================================
  const visibilityScope =
    await this.visibility.resolveUserPostVisibility({
      targetUserId,
      viewer,
    });

  // =====================================================
// PROFILE FEED VISIBILITY
// - public profile → always viewable
// - private profile → must satisfy canView
// =====================================================
if (
  visibilityScope.scope !== 'public' &&
  !visibilityScope.canView
) {
  return { items: [], nextCursor: null };
}


  const effectiveLimit = query.limit ?? 20;

  const rows = await this.repo.findUserPosts({
    userId: targetUserId,
    viewerUserId: viewer?.userId ?? null,
    limit: effectiveLimit,
    cursor: query.cursor,
    scope: visibilityScope.scope,
  });

  const items = rows.map((row) =>
    PostFeedMapper.toDto(row, viewer?.userId ?? null),
  );

  const nextCursor =
    rows.length === effectiveLimit
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
      viewerUserId: params.viewerUserId,
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

  const post = await this.repo.findPostForLike({
  postId,
  viewerUserId: userId, // ✅ ADD
});

  if (!post) {
    throw new NotFoundException('Post not found');
  }

  this.policy.assertCanLike(post);

  const result = await this.repo.toggleLike({
    postId,
    userId,
  });

  // ===============================
// ✅ AUDIT LOG: TOGGLE LIKE
// ===============================
try {
  await this.audit.logGeneric({
    userId,
    action: result.liked ? 'post.like' : 'post.unlike',
    targetId: postId,
  });
} catch {}


  // 🔔 CREATE NOTIFICATION (only when liked, fire-and-forget, fail-soft)
  if (
    result.liked === true &&
    post.authorId !== userId
  ) {
    try {
      await this.notifications.createNotification({
        userId: post.authorId,
        actorUserId: userId,
        type: 'like',
        entityId: postId,
        payload: {
          postId,
        },
      });
    } catch {
      // ❗ notification fail ต้องไม่กระทบ like
    }
  }

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

    const post = await this.repo.findPostForLike({
  postId,
  viewerUserId: userId, // ✅ ADD
});

    this.unlikePolicy.assertCanUnlike(post);

    // idempotent: unlike ซ้ำไม่ error
const result = await this.repo.unlike({ postId, userId });

// ===============================
// ✅ AUDIT LOG: UNLIKE
// ===============================
try {
  await this.audit.logGeneric({
    userId,
    action: 'post.unlike',
    targetId: postId,
  });
} catch {}

return result;


    
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
        viewerUserId: params.viewerUserId,
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
