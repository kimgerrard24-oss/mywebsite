// backend/src/admin/users/dto/admin-user-detail.dto.ts

export class AdminUserDetailDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  role!: string;
  isDisabled!: boolean;
  createdAt!: Date;

  stats!: {
    postCount: number;
    commentCount: number;
  };

  static from(entity: any): AdminUserDetailDto {
    return {
      id: entity.id,
      username: entity.username,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      role: entity.role,
      isDisabled: entity.isDisabled,
      createdAt: entity.createdAt,
      stats: {
        postCount: entity._count?.posts ?? 0,
        commentCount: entity._count?.comments ?? 0,
      },
    };
  }
}
