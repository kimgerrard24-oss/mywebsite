// backend/src/moderation/user/dto/user-moderated-comment.dto.ts

/**
 * Response DTO for:
 * GET /moderation/me/comments/:id
 *
 * Security:
 * - No admin identity
 * - No internal audit fields
 */

export class UserModeratedCommentDto {
  comment!: {
    id: string;
    postId: string;
    content: string;
    isHidden: boolean;
    isDeleted: boolean;
    createdAt: Date;
  };

  moderation!: {
    actionType: string;
    reason: string;
    createdAt: Date;
  } | null;

  /**
   * true = user can submit new appeal
   * false = already has pending appeal or no moderation action
   */
  canAppeal!: boolean;
}
