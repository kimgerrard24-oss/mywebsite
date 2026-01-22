// backend/src/posts/visibility/posts-visibility.service.ts

import { Injectable } from '@nestjs/common';
import { PostsVisibilityRepository } from './posts-visibility.repository';
import { PostVisibilityPolicy } from './policy/post-visibility.policy';
import { PostVisibilityDecision } from './types/post-visibility.types';

@Injectable()
export class PostsVisibilityService {
  constructor(
    private readonly repo: PostsVisibilityRepository,
  ) {}

  async validateVisibility(params: {
    postId: string;
    viewerUserId: string | null;
  }): Promise<PostVisibilityDecision> {
    const { postId, viewerUserId } = params;

    const ctx = await this.repo.loadPostVisibilityContext({
      postId,
      viewerUserId,
    });

    if (!ctx.post) {
      return { canView: false, reason: 'NOT_FOUND' };
    }

    const isOwner =
      viewerUserId !== null &&
      ctx.post.authorId === viewerUserId;

    return PostVisibilityPolicy.decide({
      postExists: true,
      isDeleted: ctx.post.isDeleted,
      isHidden: ctx.post.isHidden,
      isOwner,
      isPrivateAccount: ctx.post.author.isPrivate,
      isFollower: ctx.isFollower,
      isBlockedEitherWay: ctx.isBlockedEitherWay,
    });
  }
}
