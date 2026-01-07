// frontend/src/types/comment.ts

export type Comment = {
  id: string;
  content: string;
  createdAt: string;

  isEdited: boolean;
  editedAt?: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isBlocked?: boolean;        // viewer block author
    hasBlockedViewer?: boolean; // author block viewer
  };

  isOwner: boolean;

  /**
   * ❤️ Like state (viewer-aware)
   * มาจาก backend CommentItemDto
   */
  likeCount: number;
  isLiked: boolean;
};

/**
 * Payload for creating a comment or reply
 * Used by CommentComposer / ReplyComposer
 */
export type CreateCommentPayload = {
  content: string;
  mentions?: string[];
};

/**
 * Reply payload (alias for clarity)
 */
export type CreateReplyPayload = CreateCommentPayload;
