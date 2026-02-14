// backend/src/profile/policy/profile-media-delete.policy.ts

interface DeleteProfileMediaContext {
  mediaExists: boolean;
  isOwner: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
}

export class ProfileMediaDeletePolicy {
  static decide(ctx: DeleteProfileMediaContext) {
    if (!ctx.mediaExists) {
      return { allowed: false, reason: 'NOT_FOUND' };
    }

    if (ctx.isDeleted) {
      return { allowed: false, reason: 'INVALID_STATE' };
    }

    if (ctx.isBlocked) {
      return { allowed: false, reason: 'BLOCKED' };
    }

    if (!ctx.isOwner) {
      return { allowed: false, reason: 'ACCESS_DENIED' };
    }

    return { allowed: true };
  }
}
