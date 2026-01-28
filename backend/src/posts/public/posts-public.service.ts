// backend/src/posts/public/posts-public.service.ts

import { Injectable } from '@nestjs/common';

import { PostsPublicRepository } from './posts-public.repository';
import { PostsVisibilityService } from '../visibility/posts-visibility.service';
import { PostPublicDetailDto } from './dto/post-public-detail.dto';

@Injectable()
export class PostsPublicService {
  constructor(
    private readonly repo: PostsPublicRepository,
    private readonly visibility: PostsVisibilityService,
  ) {}

  async getPublicPostDetail(params: {
    postId: string;
    viewerUserId: string | null;
  }): Promise<PostPublicDetailDto | null> {
    const { postId, viewerUserId } = params;

    // =========================
    // 1) Load candidate post
    // =========================
    const post = await this.repo.findPublicPostById({
      postId,
      viewerUserId,
    });

    if (!post) return null;

    // =========================
    // 2) Final authority check
    // =========================
    const decision =
      await this.visibility.validateVisibility({
        postId,
        viewerUserId,
      });

    if (!decision.canView) return null;

    // =========================
    // 3) Map DTO
    // =========================
    return PostPublicDetailDto.from(post);
  }
}
