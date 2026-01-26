// backend/src/posts/events/post-user-tag-updated.event.ts

export class PostUserTagUpdatedEvent {
  constructor(
    public readonly payload: {
      postId: string;
      tagId: string;
      status: 'ACCEPTED' | 'REJECTED' | 'REMOVED';
      taggedUserId: string;
      taggedByUserId: string;
    },
  ) {}
}
