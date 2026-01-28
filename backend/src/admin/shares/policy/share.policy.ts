// backend/src/admin/shares/policy/moderation-share.policy.ts

export type ShareDecision =
  | 'OK'
  | 'NOT_FOUND'
  | 'ALREADY_DISABLED';

export class SharePolicy {
  static decide(ctx: {
    share: {
      isDisabled: boolean;
    } | null;
  }): ShareDecision {
    if (!ctx.share) return 'NOT_FOUND';
    if (ctx.share.isDisabled) return 'ALREADY_DISABLED';
    return 'OK';
  }
}
