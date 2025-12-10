// src/users/dto/user-profile.dto.ts

export class UserProfileDto {
  id!: string;
  email!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  bio!: string | null;
  createdAt!: Date;
}
