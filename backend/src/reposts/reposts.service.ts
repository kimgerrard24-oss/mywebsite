// backend/src/reposts/reposts.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RepostsRepository } from './reposts.repository';
import { PostsVisibilityService } from '../posts/visibility/posts-visibility.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepostsService {
  constructor(
    private readonly repo: RepostsRepository,
    private readonly visibilityService: PostsVisibilityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService, 
  ) {}

  async createRepost(params: {
    actorUserId: string;
    postId: string;
  }): Promise<{
    repostId: string;
    originalPostId: string;
    createdAt: Date;
  }> {
    const { actorUserId, postId } = params;

    // ======================================================
    // 1) Visibility gate (backend authority)
    // ======================================================
    const decision =
      await this.visibilityService.validateVisibility({
        postId,
        viewerUserId: actorUserId,
      });

    if (!decision.canView) {
      if (decision.reason === 'NOT_FOUND') {
        throw new NotFoundException('Post not found');
      }

      throw new ForbiddenException(
        `Cannot repost post: ${decision.reason}`,
      );
    }

    // ======================================================
    // 2) Idempotency check
    // ======================================================
    const existing = await this.repo.findExistingRepost({
      actorUserId,
      postId,
    });

    if (existing) {
      return {
        repostId: existing.id,
        originalPostId: existing.originalPostId,
        createdAt: existing.createdAt,
      };
    }

    // ======================================================
    // 3) Create repost + increment count (ATOMIC)
    // ======================================================
    const repost = await this.prisma.$transaction(
      async (tx) => {
        const created = await tx.repost.create({
          data: {
            actorUserId,
            originalPostId: postId,
          },
          select: {
            id: true,
            originalPostId: true,
            createdAt: true,
            originalPost: {
              select: {
                authorId: true,
              },
            },
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            repostCount: { increment: 1 },
          },
        });

        return {
          id: created.id,
          originalPostId: created.originalPostId,
          createdAt: created.createdAt,
          originalPostAuthorId:
            created.originalPost.authorId,
        };
      },
    );

    // ======================================================
    // 4) Emit domain event (FAIL-SOFT)
    // ======================================================
    try {
      this.eventEmitter.emit('post.reposted', {
        repostId: repost.id,
        postId,
        actorUserId,
        originalPostAuthorId:
          repost.originalPostAuthorId,
        createdAt: repost.createdAt,
      });
    } catch {
      // ❗ event must never break repost
    }

    // ======================================================
    // 5) Return minimal response
    // ======================================================
    return {
      repostId: repost.id,
      originalPostId: repost.originalPostId,
      createdAt: repost.createdAt,
    };
  }

  async deleteRepost(params: {
    actorUserId: string;
    postId: string;
  }): Promise<void> {
    const { actorUserId, postId } = params;

    const decision =
      await this.visibilityService.validateVisibility({
        postId,
        viewerUserId: actorUserId,
      });

    if (!decision.canView) {
      if (decision.reason === 'NOT_FOUND') {
        throw new NotFoundException('Post not found');
      }

      throw new ForbiddenException(
        `Cannot undo repost: ${decision.reason}`,
      );
    }

    const repost =
      await this.repo.findActiveRepost({
        actorUserId,
        postId,
      });

    if (!repost) return;

    // ======================================================
    // 🧨 Undo repost + decrement count (ATOMIC)
    // ======================================================
    await this.prisma.$transaction([
      this.prisma.repost.update({
        where: { id: repost.id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: {
          repostCount: { decrement: 1 },
        },
      }),
    ]);
  }

  async getPostReposts(params: {
    postId: string;
    viewerUserId: string;
    limit: number;
    cursor?: string;
  }) {
    const { postId, viewerUserId, limit, cursor } =
      params;

    const decision =
      await this.visibilityService.validateVisibility({
        postId,
        viewerUserId,
      });

    if (!decision.canView) {
      throw new NotFoundException('Post not found');
    }

    const { rows, nextCursor } =
      await this.repo.findRepostsByPostId({
        postId,
        viewerUserId,
        limit,
        cursor,
      });

    return {
      items: rows.map((r) => ({
        userId: r.user.id,
        displayName: r.user.displayName,
        avatarUrl: r.user.avatarUrl,
        repostedAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }
}

