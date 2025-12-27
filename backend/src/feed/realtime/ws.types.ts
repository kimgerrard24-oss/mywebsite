// backend/src/feed/realtime/ws.types.ts

export const WS_FEED_EVENTS = {
  NEW_POST: 'feed:new-post',
  INVALIDATE: 'feed:invalidate',
} as const;

/**
 * Feed realtime event
 * ❗ ไม่ส่ง post เต็ม
 * ❗ เป็น signal เท่านั้น
 */
export type FeedNewPostEvent = {
  postId: string;
  authorId: string;
};

export type FeedInvalidateEvent = {
  reason: 'new-post' | 'privacy-change';
};
