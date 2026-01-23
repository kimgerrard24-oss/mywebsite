// backend/src/feed/events/feed-events.listener.ts

import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

/**
 * =========================================================
 * Feed Events Listener (Async Fan-out Worker)
 * =========================================================
 *
 * Responsibilities:
 * - Listen to post.created domain event
 * - Cursor-paginate followers (no full table scan)
 * - Batch-create feed notifications
 * - Trigger realtime fan-out via NotificationRealtimeService
 *
 * Architecture:
 * - DB (authority) → Redis (cache/session) → Realtime (Socket.IO)
 *
 * Guarantees:
 * - Must NOT block post creation
 * - Best-effort delivery (fail-soft)
 */
@Injectable()
export class FeedEventsListener implements OnModuleInit {
  private readonly logger = new Logger(
    FeedEventsListener.name,
  );

  /**
   * Tune by infra capacity
   */
  private readonly BATCH_SIZE = 500;
  private readonly PAUSE_BETWEEN_BATCH_MS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.logger.log(
      '[init] FeedEventsListener ready (post.created)',
    );
  }

  /**
   * =========================================================
   * POST CREATED EVENT
   * =========================================================
   *
   * Emitted by:
   * - PostsService.createPost() AFTER DB commit
   */
  @OnEvent('post.created', {
    async: true, // 🔥 never block emitter
  })
  async handlePostCreated(event: {
    id: string;
    authorId: string;
    createdAt: Date;
    mediaIds?: string[];
  }) {
    const { id: postId, authorId } = event;

    const startedAt = Date.now();

    this.logger.log(
      `[post.created] fan-out start post=${postId} author=${authorId}`,
    );

    /**
     * Cursor for compound unique key:
     * (followerId, followingId)
     */
    let cursor:
      | {
          followerId_followingId: {
            followerId: string;
            followingId: string;
          };
        }
      | null = null;

    let totalProcessed = 0;
    let batchCount = 0;

    try {
      while (true) {
        /**
         * =================================================
         * Load next follower batch (cursor pagination)
         * =================================================
         */
        const batch: Array<{
          followerId: string;
          followingId: string;
        }> = await this.prisma.follow.findMany({
          where: {
            followingId: authorId,
          },
          take: this.BATCH_SIZE,
          ...(cursor && {
            skip: 1,
            cursor,
          }),
          orderBy: [
            { followingId: 'asc' },
            { followerId: 'asc' },
          ],
          select: {
            followerId: true,
            followingId: true,
          },
        });

        if (batch.length === 0) break;

        batchCount += 1;
        totalProcessed += batch.length;

        /**
         * =================================================
         * Fan-out batch
         * =================================================
         */
        await this.processFollowerBatch({
          postId,
          authorId,
          followerIds: batch.map(
            (b) => b.followerId,
          ),
        });

        /**
         * Advance cursor (compound)
         */
        const last = batch[batch.length - 1];
        cursor = {
          followerId_followingId: {
            followerId: last.followerId,
            followingId: last.followingId,
          },
        };

        /**
         * Yield event loop (avoid starving Node)
         */
        if (this.PAUSE_BETWEEN_BATCH_MS > 0) {
          await this.sleep(
            this.PAUSE_BETWEEN_BATCH_MS,
          );
        }
      }

      const duration = Date.now() - startedAt;

      this.logger.log(
        `[post.created] fan-out done post=${postId} batches=${batchCount} users=${totalProcessed} duration=${duration}ms`,
      );
    } catch (err) {
      this.logger.error(
        `[post.created] fan-out failed post=${postId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  /**
   * =========================================================
   * PROCESS FOLLOWER BATCH
   * =========================================================
   *
   * - Bulk insert notifications
   * - Cache invalidation
   * - Realtime emit (inside NotificationsService)
   */
  private async processFollowerBatch(params: {
    postId: string;
    authorId: string;
    followerIds: string[];
  }) {
    const { postId, authorId, followerIds } = params;

    if (followerIds.length === 0) return;

    const inputs = followerIds.map(
      (userId) => ({
        userId,
        actorUserId: authorId,
        type: 'feed_new_post' as const,
        entityId: postId,
        payload: {
          postId,
          authorId,
        },
      }),
    );

    try {
      await this.notifications.createFeedBatch(
        inputs,
      );
    } catch (err) {
      this.logger.error(
        `[feed-batch] failed size=${inputs.length} post=${postId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  /**
   * Yield event loop
   */
  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
