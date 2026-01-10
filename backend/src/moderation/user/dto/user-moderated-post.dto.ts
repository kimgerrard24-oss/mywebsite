// backend/src/moderation/user/dto/user-moderated-post.dto.ts

/**
 * Response DTO for:
 * GET /moderation/me/posts/:id
 *
 * Security:
 * - No admin identity
 * - No internal audit fields
 */

export class UserModeratedPostDto {
  post!: {
    id: string;
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
