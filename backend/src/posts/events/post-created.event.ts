// backend/src/posts/events/post-created.event.ts
import { Injectable, Logger } from '@nestjs/common';

/**
 * Payload ขั้นต่ำ (BACKWARD COMPATIBLE)
 * - ของเดิมใช้แค่นี้
 */
export type PostCreatedEventPayload = {
  id: string;
  authorId: string;

  /**
   * Optional fields (future-safe)
   * - ไม่บังคับ
   * - เพิ่มได้โดยไม่กระทบ code เดิม
   */
  createdAt?: Date;
  mediaIds?: string[];
};

@Injectable()
export class PostCreatedEvent {
  private readonly logger = new Logger(PostCreatedEvent.name);

  emit(post: PostCreatedEventPayload): void {
    /**
     * ================================
     * CURRENT BEHAVIOR (NO SIDE EFFECT)
     * ================================
     * - ตอนนี้ยังไม่ทำอะไรจริง
     * - แค่รับ event ไว้
     */
    this.logger.debug(
      `PostCreatedEvent emitted: postId=${post.id}, authorId=${post.authorId}`,
    );

    /**
     * ================================
     * FUTURE EXTENSIONS (SAFE)
     * ================================
     * - Redis Pub/Sub
     * - Fanout feed
     * - Notification
     *
     * ตัวอย่าง (ยังไม่เปิดใช้จริง):
     *
     * this.redisPub.publish('post.created', {
     *   postId: post.id,
     *   authorId: post.authorId,
     *   mediaIds: post.mediaIds ?? [],
     *   createdAt: post.createdAt ?? new Date(),
     * });
     */

    return;
  }
}
