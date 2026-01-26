// backend/src/users/dto/my-tagged-post-feed-item.dto.ts
import { PostUserTagStatus } from '@prisma/client';

export class MyTaggedPostFeedItemDto {
  id!: string;
  authorId!: string;
  content!: string;
  createdAt!: string;
  likeCount!: number;
  commentCount!: number;

  userTags!: {
    id: string;
    status: PostUserTagStatus;
  }[];

  static fromEntity(row: {
    id: string;
    status: PostUserTagStatus;
    post: {
      id: string;
      authorId: string;
      content: string;
      createdAt: Date;
      likeCount: number;
      commentCount: number;
    };
  }): MyTaggedPostFeedItemDto {
    return {
      id: row.post.id,
      authorId: row.post.authorId,
      content: row.post.content,
      createdAt: row.post.createdAt.toISOString(),
      likeCount: row.post.likeCount,
      commentCount: row.post.commentCount,

      userTags: [
        {
          id: row.id,
          status: row.status,
        },
      ],
    };
  }
}


