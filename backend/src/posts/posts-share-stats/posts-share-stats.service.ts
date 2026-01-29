// backend/src/posts/share-stats/posts-share-stats.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PostsShareStatsRepository } from './posts-share-stats.repository';
import { PostShareStatsVisibilityPolicy } from './policy/post-share-stats-visibility.policy';

@Injectable()
export class PostsShareStatsService {
  constructor(
    private readonly repo: PostsShareStatsRepository,
  ) {}

  /**
   * FINAL AUTHORITY:
   * Service → Repo(load) → Policy → return
   */
  async getShareStats(params: {
    postId: string;
    viewerUserId: string;
  }) {
    const ctx =
      await this.repo.loadContext(params);

    const decision =
      PostShareStatsVisibilityPolicy.decide({
        post: ctx.post,
        isOwner: !!ctx.isOwner,
        isFollower: !!ctx.isFollower,
        isBlockedEitherWay:
          !!ctx.isBlockedEitherWay,
        visibilityRule: ctx.visibilityRule ?? null,
        isAuthorPrivate:
          ctx.post?.author?.isPrivate ?? false,
      } as any);

    if (decision === 'NOT_FOUND') {
      throw new NotFoundException(
        'Post not found',
      );
    }

    if (decision !== 'OK') {
      throw new ForbiddenException(
        'Not allowed to view share stats',
      );
    }

    const stats = ctx.stats;

    return {
      postId: params.postId,
      internalShareCount:
        stats?.internalShareCount ?? 0,
      externalShareCount:
        stats?.externalShareCount ?? 0,
      updatedAt:
        stats?.updatedAt?.toISOString() ??
        new Date(0).toISOString(),
    };
  }
}
