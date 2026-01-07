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

    /**
     * 🔒 Block relationship flags (backend authority)
     * - isBlocked: viewer blocked this author
     * - hasBlockedViewer: author blocked viewer
     * UX only — real enforcement must be in service / permission layer
     */
    isBlocked?: boolean;
    hasBlockedViewer?: boolean;
  };

  isOwner!: boolean;

  likeCount!: number;
  isLiked!: boolean;
}
