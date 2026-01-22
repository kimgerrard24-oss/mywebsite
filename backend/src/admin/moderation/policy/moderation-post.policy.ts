// backend/src/admin/moderation/policy/moderation-post.policy.ts

export class ModerationPostPolicy {
  static assertCanOverride(params: {
    isDeleted: boolean;
    isHidden: boolean;
  }) {
    if (params.isDeleted) {
      throw new Error('Cannot override deleted post');
    }
  }
}
