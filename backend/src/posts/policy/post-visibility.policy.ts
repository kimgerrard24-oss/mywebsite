// backend/src/posts/policy/post-visibility.policy.ts
import { PostVisibility } from '@prisma/client';

export class PostVisibilityPolicy {
  static canView(params: {
    visibility: PostVisibility;
    authorId: string;
    viewerId: string | null;
  }): boolean {
    switch (params.visibility) {
      case PostVisibility.PUBLIC:
        return true;

      case PostVisibility.PRIVATE:
        return params.viewerId === params.authorId;

      default:
        return false;
    }
  }
}
