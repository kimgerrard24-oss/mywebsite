// backend/src/posts/events/post-user-tag.events.ts

import { PostUserTagStatus } from '@prisma/client';

export class PostUserTagUpdatedEvent {
  constructor(
    public readonly payload: {
      postId: string;
      tagId: string;
      status: PostUserTagStatus;
      taggedUserId: string;
      taggedByUserId: string;
    },
  ) {}
}
