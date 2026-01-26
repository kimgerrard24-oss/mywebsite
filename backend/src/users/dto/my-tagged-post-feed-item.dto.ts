// backend/src/users/dto/my-tagged-post-feed-item.dto.ts

export class MyTaggedPostFeedItemDto {
  id!: string;
  authorId!: string;
  content!: string;
  createdAt!: string;
  likeCount!: number;
  commentCount!: number;

  static fromEntity(post: {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
  }): MyTaggedPostFeedItemDto {
    return {
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
    };
  }
}
