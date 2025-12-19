// backend/src/posts/posts.service.ts
import { Injectable,NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCreatePolicy } from './policy/post-create.policy';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PostFeedMapper } from './mappers/post-feed.mapper';
import { PostVisibilityService } from './services/post-visibility.service';
import { PostCacheService } from './cache/post-cache.service';
import { PostDetailDto } from './dto/post-detail.dto';
import { PostDeletePolicy } from './policy/post-delete.policy';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private readonly audit: PostAudit,
    private readonly event: PostCreatedEvent,
    private readonly visibility: PostVisibilityService,
    private readonly cache: PostCacheService,
  ) {}

  async createPost(params: {
    authorId: string;
    content: string;
  }) {
    const { authorId, content } = params;

    PostCreatePolicy.assertCanCreatePost();

    const post = await this.repo.create({
      authorId,
      content,
    });

    this.audit.logPostCreated({
      postId: post.id,
      authorId,
    });

    this.event.emit(post);

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

    const items = rows.map(PostFeedMapper.toDto);

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

  // --------------------------------------------------
  // 1) Public cache (viewer === null เท่านั้น)
  // --------------------------------------------------
  if (!viewer) {
    const cached = await this.cache.get(postId);
    if (cached) return cached;
  }

  // --------------------------------------------------
  // 2) Load post
  // --------------------------------------------------
  const post = await this.repo.findPostById(postId);
  if (!post) return null;

  // --------------------------------------------------
  // 3) Visibility / permission check
  // --------------------------------------------------
  const canView = await this.visibility.canViewPost({
    post,
    viewer,
  });
  if (!canView) return null;

  // --------------------------------------------------
  // 4) Map to DTO
  // --------------------------------------------------
  const dto = PostDetailDto.from(post);

  // ===== แก้ตรงนี้จุดเดียว =====
  dto.canDelete =
    !!viewer && viewer.userId === post.author.id;
  // ===== จบ =====

  // --------------------------------------------------
  // 5) Cache only PUBLIC + anonymous
  // --------------------------------------------------
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

  await this.repo.softDelete(postId);

  await this.audit.logDeleted({
    postId,
    actorUserId,
  });
 }


}
