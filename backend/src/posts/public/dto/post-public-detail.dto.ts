// backend/src/posts/public/dto/post-public-detail.dto.ts

export class PostPublicDetailDto {
  id!: string;
  content!: string;
  createdAt!: string;

  likeCount!: number;
  commentCount!: number;

  author!: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  media!: Array<{
    id: string;
    mediaType: string;
    objectKey: string;
    width: number | null;
    height: number | null;
    duration: number | null;
  }>;

  taggedUsers!: Array<{
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }>;

  static from(row: any): PostPublicDetailDto {
    const dto = new PostPublicDetailDto();

    dto.id = row.id;
    dto.content = row.content;
    dto.createdAt = row.createdAt.toISOString();

    dto.likeCount = row.likeCount;
    dto.commentCount = row.commentCount;

    dto.author = {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.displayName ?? null,
      avatarUrl: row.author.avatarUrl ?? null,
    };

    dto.media = row.media.map((m: any) => ({
      id: m.media.id,
      mediaType: m.media.mediaType,
      objectKey: m.media.objectKey,
      width: m.media.width,
      height: m.media.height,
      duration: m.media.duration,
    }));

    dto.taggedUsers = row.userTags.map((t: any) => ({
      id: t.taggedUser.id,
      username: t.taggedUser.username,
      displayName: t.taggedUser.displayName ?? null,
      avatarUrl: t.taggedUser.avatarUrl ?? null,
    }));

    return dto;
  }
}
