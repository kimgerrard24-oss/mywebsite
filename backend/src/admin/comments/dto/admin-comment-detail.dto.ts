// backend/src/admin/comments/dto/admin-comment-detail.dto.ts

export class AdminCommentDetailDto {
  id!: string;
  content!: string;
  createdAt!: Date;

  isHidden!: boolean;
  isDeleted!: boolean;
  deletedSource?: string | null;

  author!: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  post!: {
    id: string;
    content: string;
    authorId: string;
  };

  static from(entity: any): AdminCommentDetailDto {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      isHidden: entity.isHidden ?? false,
      isDeleted: entity.isDeleted ?? false,
      deletedSource: entity.deletedSource ?? null,
      author: entity.author,
      post: entity.post,
    };
  }
}
