// backend/src/posts/public/posts-public-share.service.ts

import { Injectable } from '@nestjs/common';
import { PostVisibility, MediaType } from '@prisma/client';

import { PostsRepository } from '../posts.repository';
import type { PublicPostShareResponse } from './dto/public-post-share.response';

@Injectable()
export class PostsPublicShareService {
  constructor(
    private readonly postsRepo: PostsRepository,
  ) {}

  async getPostForShare(
    postId: string,
  ): Promise<PublicPostShareResponse | null> {
    const post =
      await this.postsRepo.findPostForPublicShare(postId);

    if (!post) return null;

    // 🔒 FINAL AUTHORITY CHECK
    if (post.visibility !== PostVisibility.PUBLIC) {
      return null;
    }

    const firstMedia = post.media[0]?.media ?? null;

    return {
      id: post.id,
      content: post.content,
      author: {
        // ✅ normalize null → string
        displayName:
          post.author.displayName ??
          'PhlyPhant User',
      },
      media: firstMedia
        ? [
            {
              type:
                firstMedia.mediaType === MediaType.IMAGE
                  ? 'image'
                  : 'video',
              cdnUrl: this.buildCdnUrl(firstMedia.objectKey),
              width: firstMedia.width ?? 0,
              height: firstMedia.height ?? 0,
            },
          ]
        : [],
      createdAt: post.createdAt.toISOString(),
    };
  }

  /**
   * ==========================================
   * Build CDN URL (internal helper)
   * ==========================================
   *  ห้าม expose objectKey ตรง ๆ
   *  ใช้ CDN / CloudFront / R2 domain เท่านั้น
   */
  private buildCdnUrl(objectKey: string): string {
    return `https://cdn.phlyphant.com/${objectKey}`;
  }
}
