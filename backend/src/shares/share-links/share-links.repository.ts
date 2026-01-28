// backend/src/shares/share-links/share-links.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VisibilityRuleType } from '@prisma/client';

@Injectable()
export class ShareLinksRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Load context for resolving external share link
   * Authority:
   *  - visibility must be evaluated against VIEWER, not creator
   */
  async loadContext(params: {
    code: string;
    viewerUserId: string | null;
  }) {
    const { code, viewerUserId } = params;

    const link = await this.prisma.shareLink.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        postId: true,
        isDisabled: true,
        disabledAt: true,
        expiresAt: true,
        creatorId: true,

        post: {
          select: {
            id: true,
            authorId: true,
            isDeleted: true,
            isHidden: true,
            visibility: true,
            author: {
              select: {
                id: true,
                isPrivate: true,
              },
            },
          },
        },
      },
    });

    if (!link) {
      return { link: null as any };
    }

    /**
     * =================================================
     * Viewer-based relations (NOT creator-based)
     * =================================================
     */

    const viewerId = viewerUserId;

    const [block1, block2, follow, visibilityRule] =
      await Promise.all([
        // viewer -> author
        viewerId
          ? this.prisma.userBlock.findFirst({
              where: {
                blockerId: viewerId,
                blockedId: link.post.authorId,
              },
              select: { blockerId: true },
            })
          : null,

        // author -> viewer
        viewerId
          ? this.prisma.userBlock.findFirst({
              where: {
                blockerId: link.post.authorId,
                blockedId: viewerId,
              },
              select: { blockerId: true },
            })
          : null,

        // viewer follows author
        viewerId
          ? this.prisma.follow.findFirst({
              where: {
                followerId: viewerId,
                followingId: link.post.authorId,
              },
              select: { followerId: true },
            })
          : null,

        // post visibility rule for viewer
        viewerId
          ? this.prisma.postVisibilityRule.findFirst({
              where: {
                postId: link.postId,
                userId: viewerId,
              },
              select: { rule: true },
            })
          : null,
      ]);

    return {
      link,
      post: link.post,

      isBlockedEitherWay: !!block1 || !!block2,
      isFollower: !!follow,
      visibilityRule:
        visibilityRule?.rule ?? null,
    };
  }

  /**
   * Fail-soft stats update
   */
  async updateStats(params: {
    linkId: string;
    postId: string;
  }) {
    await Promise.all([
      this.prisma.shareLink.update({
        where: { id: params.linkId },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      }),

      this.prisma.postShareStat.upsert({
        where: { postId: params.postId },
        create: {
          postId: params.postId,
          externalShareCount: 1,
        },
        update: {
          externalShareCount: { increment: 1 },
        },
      }),
    ]);
  }
}
