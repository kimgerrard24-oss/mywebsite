// backend/src/posts/events/post-user-tag-viewed.event.ts

export class PostUserTagViewedEvent {
  constructor(
    public readonly payload: {
      postId: string;
      viewerUserId: string | null;
    },
  ) {}
}
