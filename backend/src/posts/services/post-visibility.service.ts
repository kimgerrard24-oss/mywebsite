// backend/src/posts/services/post-visibility.service.ts
import { Injectable } from '@nestjs/common';
import { PostVisibilityPolicy } from '../policy/post-visibility.policy';

@Injectable()
export class PostVisibilityService {
  async canViewPost(params: {
    post: any;
    viewer: { userId: string } | null;
  }): Promise<boolean> {
    return PostVisibilityPolicy.canView({
      visibility: params.post.visibility,
      authorId: params.post.authorId,
      viewerId: params.viewer?.userId ?? null,
    });
  }
}
