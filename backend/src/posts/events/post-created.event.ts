// backend/src/posts/events/post-created.event.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostCreatedEvent {
  emit(post: { id: string; authorId: string }) {
    /**
     * Future:
     * - publish Redis event
     * - update feed
     * - notify followers
     */
    return;
  }
}
