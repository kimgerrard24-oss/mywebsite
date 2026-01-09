// backend/src/comments/dto/comment-item.dto.ts

export class CommentItemDto {
  id!: string;
  content!: string;
  createdAt!: string;

  isEdited!: boolean;
  editedAt?: string;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isBlocked?: boolean;
    hasBlockedViewer?: boolean;
  };

  isOwner!: boolean;

  likeCount!: number;
  isLiked!: boolean;

  /**
   * ✅ UX guard only
   * backend is authority in POST /appeals
   */
  canAppeal!: boolean;
}

