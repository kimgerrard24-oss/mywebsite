// backend/src/profile-update/profile-update.policy.ts

export class ProfileUpdatePolicy {
  static assertCanCreateDraft(context: {
    isOwner: boolean;
    isBanned: boolean;
  }) {
    if (!context.isOwner) {
      throw new Error('NOT_OWNER');
    }

    if (context.isBanned) {
      throw new Error('USER_BANNED');
    }
  }
}
