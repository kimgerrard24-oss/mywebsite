// backend/src/posts/dto/post-feed-item.dto.ts
export class PostFeedItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isFollowing: boolean;
  };

  media!: {
    id: string;
    type: 'image' | 'video';
    url: string;
    objectKey: string;
  }[];
   
  isSelf!: boolean;
    
  stats!: {
    likeCount: number;
    commentCount: number;
  };
  
  canDelete!: boolean;
}
