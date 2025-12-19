// backend/src/posts/policy/post-delete.policy.ts
import { ForbiddenException } from '@nestjs/common';


 export class PostDeletePolicy {
  static assertCanDelete(params: {
  actorUserId: string;
  ownerUserId: string;
 }) {
   const { actorUserId, ownerUserId } = params;

   if (actorUserId !== ownerUserId) {
  throw new ForbiddenException('You cannot delete this post');
   }
  }
}