// backend/src/posts/dto/post-feed-item.dto.ts

export class PostFeedItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  isTaggedUser!: boolean;
  isHiddenByTaggedUser!: boolean;

  type?: 'post' | 'repost';

   repost?: {
    repostId: string;
    repostedAt: string;

    actor: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  };

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    // ===== follow state =====
    isFollowing: boolean;
    isFollowRequested: boolean;

    // ===== privacy / block =====
    isBlocked: boolean;
    isPrivate: boolean;
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
    repostCount: number;
  };

  hasReposted?: boolean;


  canDelete!: boolean;

  taggedUsers!: {
    id: string;
    displayName: string | null;
    username: string;
  }[];
  /**
   * 📨 Appeal (UX guard only)
   * backend authority อยู่ที่ POST /appeals
   */
  canAppeal?: boolean;
}

