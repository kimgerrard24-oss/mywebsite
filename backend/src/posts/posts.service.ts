// backend/src/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCreatePolicy } from './policy/post-create.policy';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PostFeedMapper } from './mappers/post-feed.mapper';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private readonly audit: PostAudit,
    private readonly event: PostCreatedEvent,
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
}
