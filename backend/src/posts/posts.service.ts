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

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private readonly audit: PostAudit,
    private readonly event: PostCreatedEvent,
    private readonly visibility: PostVisibilityService,
    private readonly cache: PostCacheService,
    private readonly prisma: PrismaService,
  ) {}

 async createPost(params: {
  authorId: string;
  dto?: CreatePostDto; // รองรับแบบใหม่
  content?: string;    // รองรับแบบเดิม
}) {
  const { authorId } = params;

  /**
   * ==============================
   * Normalize input (BACKWARD SAFE)
   * ==============================
   */
  const content =
    params.dto?.content ??
    params.content ??
    '';

  const mediaIds =
    params.dto?.mediaIds ?? [];

  // 0️⃣ permission (เดิม)
  PostCreatePolicy.assertCanCreatePost();

  // 1️⃣ business validation
  PostCreatePolicy.assertValid({
    content,
    mediaCount: mediaIds.length,
  });

  // 2️⃣ validate media ownership (schema ใหม่)
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

  // 3️⃣ transaction-safe create
  const post = await this.prisma.$transaction(
    async (tx) => {
      // 3.1 create post (เดิม)
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

      // 3.2 attach media (ใหม่ – ถูก schema)
      if (mediaIds.length > 0) {
        await tx.postMedia.createMany({
          data: mediaIds.map((mediaId) => ({
            postId: createdPost.id,
            mediaId,
          })),
          skipDuplicates: true,
        });
      }

      return createdPost;
    },
  );

  // 4️⃣ audit + event (เดิม 100%)
  this.audit.logPostCreated({
    postId: post.id,
    authorId,
  });

  this.event.emit({
    id: post.id,
    authorId,
    createdAt: post.createdAt,
    mediaIds,
  });

  // 5️⃣ response (เดิม 100%)
  return {
    id: post.id,
    createdAt: post.createdAt,
  };
}


 async getPublicFeed(params: {
  viewerUserId: string | null;
  limit: number;
  cursor?: string;
 }) {
  const { viewerUserId, limit, cursor } = params;

  const rows = await this.repo.findPublicFeed({
    limit,
    cursor,
    viewerUserId,
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

    // 4) Map DTO
    const dto = PostDetailDto.from(post);

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

}
