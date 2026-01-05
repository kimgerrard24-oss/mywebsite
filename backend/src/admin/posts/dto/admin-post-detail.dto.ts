// backend/src/admin/posts/dto/admin-post-detail.dto.ts

export class AdminPostDetailDto {
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

  stats!: {
    commentCount: number;
    likeCount: number;
  };

  static from(entity: any): AdminPostDetailDto {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      isHidden: entity.isHidden ?? false,
      isDeleted: entity.isDeleted ?? false,
      deletedSource: entity.deletedSource ?? null,
      author: entity.author,
      stats: {
        commentCount: entity._count?.comments ?? 0,
        likeCount: entity._count?.likes ?? 0,
      },
    };
  }
}
