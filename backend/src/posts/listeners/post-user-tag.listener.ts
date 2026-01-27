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
  // intentionally no notification for tag accept/reject/remove
  return;
}
}


