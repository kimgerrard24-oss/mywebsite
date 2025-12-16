// backend/src/users/dto/public-user-search.dto.ts
export class PublicUserSearchDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;

  static fromEntity(entity: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }): PublicUserSearchDto {
    return {
      id: entity.id,
      username: entity.username,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
    };
  }
}
