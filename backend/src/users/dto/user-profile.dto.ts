// src/users/dto/user-profile.dto.ts

export class UserProfileDto {
  id: string;
  email: string;
  username: string;
  firebaseUid: string | null;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  isSelf: boolean;

  constructor(
    user: any,
    options?: {
      isSelf?: boolean;
    },
  ) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.firebaseUid = user.firebaseUid ?? null;
    this.name = user.name ?? null;
    this.displayName = user.displayName ?? null;
    this.avatarUrl = user.avatarUrl ?? null;
    this.coverUrl = user.coverUrl ?? null;
    this.bio = user.bio ?? null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    this.isSelf = options?.isSelf ?? false;
  }

  static fromUser(
    user: any,
    options?: {
      isSelf?: boolean;
    },
  ): UserProfileDto {
    return new UserProfileDto(user, options);
  }
}
