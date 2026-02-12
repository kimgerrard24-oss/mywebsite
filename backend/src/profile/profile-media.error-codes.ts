// backend/src/profile/profile-media.error-codes.ts

export enum ProfileMediaAccessErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  USER_BANNED = 'USER_BANNED',
  USER_INACTIVE = 'USER_INACTIVE',
  BLOCKED = 'BLOCKED',
  PRIVATE_ACCOUNT = 'PRIVATE_ACCOUNT',
  INVALID_MEDIA_CATEGORY = 'INVALID_MEDIA_CATEGORY',
}
