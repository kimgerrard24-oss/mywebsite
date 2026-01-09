// backend/src/comments/mappers/comment.mapper.ts
import { CommentItemDto } from '../dto/comment-item.dto';

export class CommentMapper {
  /**
   * =====================================================
   * Map Comment Entity → CommentItemDto (viewer-aware)
   * =====================================================
   */
  static toItemDto(
    comment: any,
    viewerUserId: string | null,
  ): CommentItemDto {
    if (!comment) {
      throw new Error('CommentMapper: comment is null');
    }

    if (!comment.author) {
      throw new Error(
        'CommentMapper: author relation is missing',
      );
    }

    /**
     * =========================
     * ❤️ Like metadata (safe)
     * =========================
     */
    const likeCount =
      typeof comment._count?.likes === 'number'
        ? comment._count.likes
        : 0;

    const isLiked =
      Boolean(viewerUserId) &&
      Array.isArray(comment.likes)
        ? comment.likes.some(
            (l: { userId: string }) =>
              l.userId === viewerUserId,
          )
        : false;

    /**
     * =========================
     * 🔒 Block metadata (viewer-aware)
     * =========================
     * MUST be preloaded by query (no extra DB here)
     */
    const isBlocked =
      Boolean(viewerUserId) &&
      Array.isArray(comment.author.blockedBy) &&
      comment.author.blockedBy.length > 0;

    const hasBlockedViewer =
      Boolean(viewerUserId) &&
      Array.isArray(comment.author.blockedUsers) &&
      comment.author.blockedUsers.length > 0;

    /**
     * =========================
     * ⚖️ Moderation state (UX guard only)
     * =========================
     */
    const hasActiveModeration =
      comment.isHidden === true ||
      comment.isDeleted === true;

    const isOwner =
      Boolean(viewerUserId) &&
      comment.authorId === viewerUserId;

    return {
      id: comment.id,
      content: comment.content,

      createdAt: comment.createdAt.toISOString(),

      isEdited: Boolean(comment.isEdited),
      editedAt: comment.editedAt
        ? comment.editedAt.toISOString()
        : undefined,

      author: {
        id: comment.author.id,
        displayName: comment.author.displayName ?? null,
        avatarUrl: comment.author.avatarUrl ?? null,
        isBlocked,
        hasBlockedViewer,
      },

      isOwner,

      likeCount,
      isLiked,

      /**
       * ✅ UX guard only — backend still validates in POST /appeals
       */
      canAppeal: Boolean(isOwner && hasActiveModeration),
    };
  } // ✅ ปิด toItemDto ตรงนี้

  /**
   * =====================================================
   * Map list of comments (pagination-safe)
   * =====================================================
   */
  static toItemDtos(
    comments: any[],
    viewerUserId: string | null,
  ): CommentItemDto[] {
    if (!Array.isArray(comments)) {
      return [];
    }

    return comments.map((comment) =>
      this.toItemDto(comment, viewerUserId),
    );
  }
}

