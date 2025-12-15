export class UserResponseDto {
  id!: string;
  displayName!: string | null;
  bio!: string | null;
  avatarUrl!: string | null;
  updatedAt!: Date;

  static fromUser(user: any): UserResponseDto {
    return {
      id: user.id,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt,
    };
  }
}
