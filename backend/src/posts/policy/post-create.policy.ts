// backend/src/posts/policy/post-create.policy.ts
import { BadRequestException } from '@nestjs/common';

export class PostCreatePolicy {
  /**
   * ==============================
   * Authorization / Capability
   * ==============================
   * NOTE:
   * - ใช้กับ session-based auth
   * - ตอนนี้ "ผ่าน" ทุก user ที่ session valid
   * - future: ban / trust score / rate escalation
   */
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

  /**
   * ==============================
   * Business validation
   * ==============================
   * ใช้ตรวจ payload ของ post
   * (text + mediaIds)
   */
  static assertValid(params: {
    content: string;
    mediaCount: number;
  }) {
    const { content, mediaCount } = params;

    // ❌ ห้าม post ว่างเปล่า
    if (!content.trim() && mediaCount === 0) {
      throw new BadRequestException(
        'Post must have content or media',
      );
    }

    // ❌ จำกัดจำนวน media ต่อ post
    if (mediaCount > 10) {
      throw new BadRequestException(
        'Too many media items',
      );
    }
  }
}
