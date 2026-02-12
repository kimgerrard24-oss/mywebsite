// backend/src/users/dto/user-response.dto.ts
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class UserResponseDto {
  id!: string;
  displayName!: string | null;
  coverUrl!: string | null;
  bio!: string | null;
  avatarUrl!: string | null;
  updatedAt!: Date;

  static fromUser(user: any): UserResponseDto {
    return {
      id: user.id,
      displayName: user.displayName,
      coverUrl: user.coverMedia
      ? buildCdnUrl(user.coverMedia.objectKey)
      : null,
      bio: user.bio,
      avatarUrl: user.avatarMedia
      ? buildCdnUrl(user.avatarMedia.objectKey)
      : null,
      updatedAt: user.updatedAt,
    };
  }
}
