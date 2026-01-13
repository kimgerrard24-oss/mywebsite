// backend/src/users/policies/security-events.policy.ts

export class SecurityEventsPolicy {
  static assertCanRead(params: {
    isDisabled: boolean;
    isBanned: boolean;
  }) {
    if (params.isDisabled || params.isBanned) {
      // still allow reading — but future rule can block here
      return;
    }
  }

  static normalizeLimit(limit?: number) {
    if (!limit || limit < 1) return 20;
    return Math.min(limit, 50);
  }
}
