// backend/src/media/cron/media-cleanup.cron.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { R2DeleteService } from '../../r2/r2-delete.service';
import * as Sentry from '@sentry/node';
import { AlertService } from '../../alert/alert.service';

@Injectable()
export class MediaCleanupCron {
  private readonly logger = new Logger(MediaCleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Delete: R2DeleteService,
    private readonly alert: AlertService,
  ) {}

  /**
   * =========================================================
   * Cleanup deleted media from R2
   * - Run every 3 days at 03:00
   * - Safe / Idempotent / Fail-soft
   * =========================================================
   */
  @Cron('0 3 */3 * *')
  async cleanupDeletedMedia(): Promise<void> {
    const threshold = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    );

    const medias = await this.prisma.media.findMany({
      where: {
        deletedAt: {
          lte: threshold,
        },
        cleanupAt: null,
        posts: {
          none: {},
        },
      },
      select: {
        id: true,
        objectKey: true,
        cleanupFailCount: true,
      },
      take: 100,
    });

    if (medias.length === 0) {
      return;
    }

    this.logger.log(
      `Media cleanup started (${medias.length} item(s))`,
    );

    for (const media of medias) {
      if (
        !media.objectKey ||
        media.objectKey.includes('..') ||
        media.objectKey.startsWith('/') ||
        media.objectKey.startsWith('http')
      ) {
        this.logger.warn(
          `Skip invalid objectKey mediaId=${media.id}`,
        );
        continue;
      }

      try {
        await this.prisma.media.update({
          where: { id: media.id },
          data: { cleanupAt: new Date() },
        });

        await this.r2Delete.deleteObject(media.objectKey);

        await this.prisma.media.delete({
          where: { id: media.id },
        });

        this.logger.log(
          `Media cleaned mediaId=${media.id}`,
        );
      } catch (err) {
        const failCount = (media.cleanupFailCount ?? 0) + 1;

        await this.prisma.media.update({
          where: { id: media.id },
          data: {
            cleanupFailCount: failCount,
            lastCleanupError:
              err instanceof Error ? err.message : 'unknown',
          },
        });

        this.logger.error(
          `Media cleanup failed mediaId=${media.id} (fail ${failCount})`,
          err instanceof Error ? err.stack : undefined,
        );

        /**
         * =====================================================
         * 🚨 ALERT ZONE (เพิ่มอย่างปลอดภัย)
         * =====================================================
         */
        if (failCount >= 3) {
          // 1️⃣ Alert ผ่าน AlertService (Ops / Slack / Email)
          try {
            await this.alert.notifyCritical(
              'Media cleanup failed repeatedly',
              {
                mediaId: media.id,
                objectKey: media.objectKey,
                failCount,
              },
            );
          } catch {
            // ❗ ห้ามให้ alert ทำ cron ล้ม
          }

          // 2️⃣ ส่งเข้า Sentry (สำหรับ trace & history)
          Sentry.captureMessage(
            'Media cleanup failed repeatedly',
            {
              level: 'error',
              extra: {
                mediaId: media.id,
                objectKey: media.objectKey,
                failCount,
              },
            },
          );
        }
      }
    }

    this.logger.log('Media cleanup finished');
  }
}
