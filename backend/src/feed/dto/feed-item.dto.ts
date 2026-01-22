// backend/src/feed/dto/feed-item.dto.ts

export class FeedItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  likeCount!: number;
  commentCount!: number;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    isPrivate: boolean;
    isFollowing: boolean;
    isFollowRequested: boolean;
    isBlocked: boolean;
  };

  media!: Array<{
    id: string;
    mediaType: string;
    objectKey: string;
    width: number | null;
    height: number | null;
    duration: number | null;
  }>;
}
