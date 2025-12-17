// backend/src/posts/dto/post-feed-item.dto.ts
export class PostFeedItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  stats!: {
    likeCount: number;
    commentCount: number;
  };
}
