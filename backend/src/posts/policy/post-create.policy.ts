// backend/src/posts/policy/post-create.policy.ts
export class PostCreatePolicy {
  static assertCanCreatePost() {
    /**
     * ตอนนี้:
     * - Session valid = ผ่าน
     * - ไม่เช็ค profile (fail-soft)
     *
     * Future:
     * - ban
     * - rate-limit escalation
     */
    return true;
  }
}


