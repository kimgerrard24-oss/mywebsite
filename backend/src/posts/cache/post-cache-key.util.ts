// backend/src/posts/cache/post-cache-key.util.ts
export function postDetailCacheKey(postId: string) {
  return `post:detail:${postId}`;
}
