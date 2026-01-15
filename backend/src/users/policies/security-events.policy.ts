// backend/src/users/policies/security-events.policy.ts

export class SecurityEventsPolicy {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 50;

  static assertCanRead(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked?: boolean;
  }) {
    /**
     * Current rule:
     * - Even disabled / banned / locked users
     *   can still read their own security events.
     *
     * This is intentional for:
     * - account recovery
     * - compliance (GDPR-like access)
     *
     * Future:
     * - may restrict if abuse pattern detected
     */
    return;
  }

  static normalizeLimit(limit?: number | string) {
    if (limit === undefined || limit === null) {
      return this.DEFAULT_LIMIT;
    }

    const parsed =
      typeof limit === 'string'
        ? parseInt(limit, 10)
        : limit;

    if (!Number.isFinite(parsed) || parsed < 1) {
      return this.DEFAULT_LIMIT;
    }

    return Math.min(parsed, this.MAX_LIMIT);
  }
}
