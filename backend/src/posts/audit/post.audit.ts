// backend/src/posts/audit/post.audit.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PostAudit {
  private readonly logger = new Logger('PostAudit');

  logPostCreated(params: {
    postId: string;
    authorId: string;
  }) {
    this.logger.log(
      `post_created postId=${params.postId} authorId=${params.authorId}`,
    );
  }

  async logDeleted(params: {
   postId: string;
   actorUserId: string;
   }) {
    this.logger.log(
 `POST_DELETED postId=${params.postId} actor=${params.actorUserId}`,
   );
  }
}
