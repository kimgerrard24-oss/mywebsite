// backend/src/posts/events/post-view.event.ts
export type PostViewEvent = {
  postId: string;
  viewerId: string | null;
};
