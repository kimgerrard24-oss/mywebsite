// backend/src/posts-likes/dto/post-like.dto.ts
export class PostLikeDto {
  userId!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  likedAt!: string;
}
