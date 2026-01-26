// backend/src/posts/policy/post-user-tag-view.policy.ts

export class PostUserTagViewPolicy {
  /**
   * Decide whether a tag record should be visible to viewer
   */
  static canView(params: {
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REMOVED';
    isPostOwner: boolean;
    isTaggedUser: boolean;
  }): boolean {
    const { status, isPostOwner, isTaggedUser } = params;

    if (status === 'ACCEPTED') return true;

    if (status === 'PENDING') {
      return isPostOwner || isTaggedUser;
    }

    if (status === 'REJECTED' || status === 'REMOVED') {
      return isPostOwner || isTaggedUser;
    }

    return false;
  }
}
