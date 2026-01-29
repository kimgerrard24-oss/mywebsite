// backend/src/posts/share-stats/posts-share-stats.repository.ts

export class PostShareStatsDto {
  postId!: string;

  internalShareCount!: number;
  externalShareCount!: number;

  updatedAt!: string;
}
