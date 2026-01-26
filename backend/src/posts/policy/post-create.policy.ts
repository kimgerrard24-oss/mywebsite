// backend/src/posts/policy/post-create.policy.ts
import { BadRequestException } from '@nestjs/common';

export class PostCreatePolicy {
  /**
   * ==============================
   * Authorization / Capability
   * ==============================
   */
  static assertCanCreatePost() {
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

  /**
   * ==============================
   * Friend tag payload validation
   * ==============================
   * ❗ NOT authorization
   * ❗ NOT relationship check
   * Only payload sanity check
   */
  static assertValidTaggedUsers(params: {
    taggedUserCount: number;
  }) {
    const { taggedUserCount } = params;

    // ❌ กัน spam / abuse
    if (taggedUserCount > 20) {
      throw new BadRequestException(
        'Too many tagged users',
      );
    }
  }
}

