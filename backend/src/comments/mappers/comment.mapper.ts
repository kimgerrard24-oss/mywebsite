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
     * - likeCount: derived from _count.likes
     * - isLiked: viewer-aware
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

    return {
      id: comment.id,
      content: comment.content,

      createdAt: comment.createdAt.toISOString(),

      /**
       * ✏️ Edit metadata
       * ใช้ field จาก DB โดยตรง (source of truth)
       */
      isEdited: Boolean(comment.isEdited),
      editedAt: comment.editedAt
        ? comment.editedAt.toISOString()
        : undefined,

      /**
       * 👤 Author
       */
      author: {
        id: comment.author.id,
        displayName:
          comment.author.displayName ?? null,
        avatarUrl:
          comment.author.avatarUrl ?? null,
      },

      /**
       * 🔐 Permission (viewer-aware)
       */
      isOwner:
        Boolean(viewerUserId) &&
        comment.authorId === viewerUserId,

      /**
       * ❤️ Like state (viewer-aware)
       */
      likeCount,
      isLiked,
    };
  }

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
