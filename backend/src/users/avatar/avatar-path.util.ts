// backend/src/users/avatar/avatar-path.util.ts
export function buildAvatarPath(userId: string) {
return `avatars/${userId}.webp`;
}