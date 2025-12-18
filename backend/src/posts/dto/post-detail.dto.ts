// backend/src/posts/dto/post-detail.dto.ts
export class PostDetailDto {
  id!: string;
  content!: string;
  createdAt!: Date;
  media!: {
    id: string;
    type: string;
    url: string;
  }[];

  static from(post: any): PostDetailDto {
    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      media: post.media.map((m: any) => ({
        id: m.id,
        type: m.type,
        url: m.cdnUrl, // from R2 CDN
      })),
    };
  }
}
