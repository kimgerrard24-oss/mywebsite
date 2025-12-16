// backend/src/users/cover/cover-path.util.ts
export function buildCoverPath(userId: string): string {
  return `users/${userId}/cover.webp`;
}
