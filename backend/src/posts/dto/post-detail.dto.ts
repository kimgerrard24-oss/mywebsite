// backend/src/posts/dto/post-detail.dto.ts

import { MediaType } from '@prisma/client';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

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
    type: 'image' | 'video';
    url: string;
  }[];

  likeCount!: number;
  commentCount!: number;

  isLikedByViewer!: boolean;
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

      media: Array.isArray(post.media)
        ? post.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',
            url: buildCdnUrl(pm.media.objectKey),
          }))
        : [],

      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,

      isLikedByViewer: viewerUserId
        ? Array.isArray(post.likes) && post.likes.length > 0
        : false,

      canDelete: Boolean(
        viewerUserId && post.author.id === viewerUserId,
      ),
    };
  }
}
