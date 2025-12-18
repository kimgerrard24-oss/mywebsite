// backend/src/posts/policy/post-visibility.policy.ts
export class PostVisibilityPolicy {
  static canView(params: {
    visibility: 'PUBLIC' | 'PRIVATE';
    authorId: string;
    viewerId: string | null;
  }): boolean {
    if (params.visibility === 'PUBLIC') return true;
    if (!params.viewerId) return false;
    return params.authorId === params.viewerId;
  }
}
