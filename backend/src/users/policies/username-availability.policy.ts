// backend/src/users/policies/username-availability.policy.ts

export class UsernameAvailabilityPolicy {
  private static readonly RESERVED = new Set([
    'admin',
    'administrator',
    'support',
    'system',
    'root',
    'moderator',
    'staff',
    'api',
    'auth',
    'null',
    'undefined',
    'me',
  ]);

  static normalize(username: string): string {
    return username.toLowerCase();
  }

  static assertAllowed(username: string) {
    const n = this.normalize(username);

    if (this.RESERVED.has(n)) {
      return { allowed: false, reason: 'reserved' as const };
    }

    if (n.startsWith('admin_') || n.startsWith('sys_')) {
      return { allowed: false, reason: 'reserved_prefix' as const };
    }

    return { allowed: true as const };
  }
}
