// backend/src/users/cover/cover-path.util.ts
import { randomUUID } from 'crypto';

export function buildCoverPath(userId: string): string {
  return `users/${userId}/cover/${Date.now()}-${randomUUID()}.webp`;
}
