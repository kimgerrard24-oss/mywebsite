// src/posts/events/post-liked.event.ts
import { Injectable } from '@nestjs/common';

export type PostLikedEventPayload = {
  postId: string;
  userId: string;
  liked: boolean;
};

@Injectable()
export class PostLikedEvent {
  emit(payload: PostLikedEventPayload): void {
    // 🔔 hook สำหรับ production
    // - analytics
    // - notification
    // - realtime fan-out (socket.io)
    // intentionally no side-effect for now
  }
}
