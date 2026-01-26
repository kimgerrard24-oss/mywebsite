// backend/src/posts/listeners/post-user-tag.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostUserTagUpdatedEvent } from '../events/post-user-tag.events';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PostUserTagListener {
  constructor(
    private readonly notifications: NotificationsService,
  ) {}

  @OnEvent('post.tag.updated')
  async handle(event: PostUserTagUpdatedEvent) {
    const { status, taggedUserId, taggedByUserId, postId } =
      event.payload;

    try {
      // =====================================
      // ACCEPTED
      // - ส่วนใหญ่ถูก notify ไปแล้วตอน create post
      // - ไม่ต้อง notify ซ้ำ (ลด spam)
      // =====================================
      if (status === 'ACCEPTED') {
        return;
      }

      // =====================================
      // REJECTED / REMOVED
      // semantic เดียวกัน: คนที่ tag โดนปฏิเสธ
      // =====================================
      if (status === 'REJECTED' || status === 'REMOVED') {
        await this.notifications.createNotification({
          userId: taggedByUserId,     // คนที่ tag
          actorUserId: taggedUserId,  // คนที่ถูก tag
          type: 'post_tagged_rejected',
          entityId: postId,
          payload: { postId },
        });
        return;
      }

      // PENDING or unknown → no-op
    } catch {
      // ❗ fail-soft: notification / realtime must never break domain flow
    }
  }
}


