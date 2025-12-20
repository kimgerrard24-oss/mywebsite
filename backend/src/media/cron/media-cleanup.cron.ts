// backend/src/media/cron/media-cleanup.cron.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { R2DeleteService } from '../../r2/r2-delete.service';

@Injectable()
export class MediaCleanupCron {
  private readonly logger = new Logger(MediaCleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Delete: R2DeleteService,
  ) {}

  /**
   * =========================================================
   * Cleanup deleted media from R2
   * - Run every 3 days at 03:00
   * - Safe / Idempotent / Fail-soft
   * =========================================================
   */
  @Cron('*/1 * * * *')
  async cleanupDeletedMedia(): Promise<void> {
    const threshold = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    );

    /**
     * 1️⃣ เลือกเฉพาะ media ที่:
     * - ถูก mark deleted
     * - เกิน 3 วัน
     * - ยังไม่เคย cleanup
     * - ❗ ไม่ถูกใช้งานโดย post ใด ๆ แล้ว
     */
    const medias = await this.prisma.media.findMany({
      where: {
        deletedAt: {
          lte: threshold,
        },
        cleanupAt: null,
        posts: {
          none: {}, // ✅ สำคัญ: ต้องไม่ถูกผูกกับ post ใด ๆ
        },
      },
      select: {
        id: true,
        objectKey: true,
      },
      take: 100, // batch safety
    });

    if (medias.length === 0) {
      return;
    }

    this.logger.log(
      `Media cleanup started (${medias.length} item(s))`,
    );

    for (const media of medias) {
      /**
       * =========================
       * Defensive validation
       * =========================
       */
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
        /**
         * 2️⃣ soft-lock กัน cron ซ้ำ
         */
        await this.prisma.media.update({
          where: { id: media.id },
          data: { cleanupAt: new Date() },
        });

        /**
         * 3️⃣ ลบ object จาก R2 (fail-soft)
         */
        await this.r2Delete.deleteObject(media.objectKey);

        /**
         * 4️⃣ ลบ record ออกจาก DB (final)
         */
        await this.prisma.media.delete({
          where: { id: media.id },
        });

        this.logger.log(
          `Media cleaned mediaId=${media.id}`,
        );
      } catch (err) {
        /**
         * ❗ fail-soft
         * - ห้าม throw
         * - cron ต้องทำงานต่อ
         */
        this.logger.error(
          `Media cleanup failed mediaId=${media.id}`,
          err instanceof Error ? err.stack : undefined,
        );
      }
    }

    this.logger.log('Media cleanup finished');
  }
}
