// backend/src/posts/dto/post-detail.dto.ts
export class PostDetailDto {
  id!: string;
  content!: string;
  createdAt!: Date;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  media!: {
    id: string;
    type: string;
    url: string;
  }[];

  canDelete!: boolean;

  static from(
    post: any,
    viewerUserId?: string,
  ): PostDetailDto {
    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,

      author: {
        id: post.author.id,
        displayName: post.author.displayName,
        avatarUrl: post.author.avatarUrl,
      },

      media: post.media.map((m: any) => ({
        id: m.id,
        type: m.type,
        url: m.cdnUrl,
      })),

      canDelete: Boolean(
        viewerUserId && post.author.id === viewerUserId
      ),
    };
  }
}
